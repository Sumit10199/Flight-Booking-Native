import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { CalendarList } from 'react-native-calendars';
import { endpoints } from '../../utils/endpoints';
import { GlobalResponseType, postData } from '../../utils/axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AirportSelector from './AirportSelector';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FlightPNR, User } from './types';
import { useDispatch } from 'react-redux';
import { travellerDetails } from '../../Store/BookingDetails/bookingDetails';
import Toast from 'react-native-toast-message';
import {DrawerActions, useNavigation } from '@react-navigation/native';

import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import Icon from 'react-native-vector-icons/Ionicons';

interface Travellers {
  adults: number;
  children: number;
  infants: number;
}

export interface Response {
  status: boolean;
  message: string;
  result: any;
}

interface Airline {
  airline_name: string;
  airline_code: string;
  airline_logo: string;
}

type FormValues = {
  origin: string;
  destination: string;
  departureDate: string;
  travellers: Travellers;
};

const flightSchema = Yup.object().shape({
  origin: Yup.string()
    .required('Origin is required')
    .min(3, 'Enter valid airport code'),
  destination: Yup.string()
    .required('Destination is required')
    .min(3, 'Enter valid airport code')
    .test(
      'not-same',
      'Origin and destination cannot be same',
      function (value) {
        const { origin } = this.parent;
        return origin !== value;
      },
    ),
  departureDate: Yup.string().required('Select a departure date'),
  travellers: Yup.object({
    adults: Yup.number().min(1, 'At least 1 adult').required(),
    children: Yup.number().min(0).required(),
    infants: Yup.number().min(0).required(),
  }),
});

export default function FlightSearchForm() {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const [loader, setLoader] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTravellerModal, setShowTravellerModal] = useState(false);
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [agentData, setAgentData] = useState<any>(null);
  const [user, setUser] = useState<User>();
  const [availablePnrDates, setAvailablePnrDates] = useState<any>();

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(flightSchema),
    defaultValues: {
      origin: '',
      destination: '',
      departureDate: '',
      travellers: {
        adults: 1,
        children: 0,
        infants: 0,
      },
    },
    mode: 'onChange',
  });

  const watchedDepartureDate = watch('departureDate');

  const greenMarkedDates =
    availablePnrDates?.reduce((acc: any, date: string) => {
      acc[date] = {
        selected: true,
        selectedColor: 'green',
        selectedTextColor: 'white',
      };
      return acc;
    }, {}) || {};

  function formatPassengers(data: Travellers) {
    return (
      `${data.adults} Adult${data.adults !== 1 ? 's' : ''}, ` +
      `${data.children} Children, ` +
      `${data.infants} Infant${data.infants !== 1 ? 's' : ''}`
    );
  }

  const getAirlines = async () => {
    try {
      const response: GlobalResponseType<{ status: boolean; result: any }> =
        await postData({
          url: endpoints.AIRLINE_GET,
          body: {},
        });

      if (response.status === 200 && response.data.status) {
        setAirlines(response.data.result);
      }
    } catch (err) {
      console.warn('Failed to load airlines', err);
    }
  };

  const handleDayPress = (day: any) => {
    setValue('departureDate', day.dateString);
    setShowCalendar(false);
  };

  const handleTravellerChange = (type: keyof Travellers, value: number) => {
    const current = getValues('travellers');
    const next = {
      ...current,
      [type]: Math.max(0, value),
    };
    if (type === 'adults' && next.adults < 1) next.adults = 1;
    setValue('travellers', next);
  };

  const swapFields = () => {
    const o = getValues('origin');
    const d = getValues('destination');
    setValue('origin', d);
    setValue('destination', o);
  };

  const onSubmit = async (values: FormValues) => {
    setLoader(true);
    try {
      const seats = formatPassengers(values.travellers);

      const body = {
        origin_apt: values.origin,
        destin_apt: values.destination,
        boarding_date: values.departureDate,
        seats: seats,
        type: 'single',
      };

      const response: GlobalResponseType<Response> = await postData({
        url: endpoints.GET_FLIGHT_LIST,
        body,
      });

      if (response.status === 200 && response.data.status) {
        await AsyncStorage.setItem(
          'search_details',
          JSON.stringify({
            origin: values.origin,
            destination: values.destination,
            date: values.departureDate,
            travel: seats,
          }),
        );

        const innerFlights = response.data.result?.innerFlights
          ? JSON.parse(response.data.result.innerFlights)
          : [];
        const airIq = response.data.result?.AIR_IQ
          ? JSON.parse(response.data.result.AIR_IQ)
          : [];
        const ease2fly = response.data.result?.EASE2FLY
          ? JSON.parse(response.data.result.EASE2FLY)
          : [];
        const travelogy = response.data.result?.TRAVELOGY
          ? JSON.parse(response.data.result.TRAVELOGY)
          : [];

        const flightDetails: FlightPNR[] = [
          ...innerFlights,
          ...airIq,
          ...ease2fly,
          ...travelogy,
        ];

        const sorted = flightDetails.sort(
          (a: any, b: any) =>
            new Date(a.pnr_date).getTime() - new Date(b.pnr_date).getTime(),
        );

        dispatch(travellerDetails(seats));
        if (sorted && sorted.length > 0) {
          navigation.navigate('Flight_List', { flights: sorted, airlines });
        } else {
          Toast.show({
            text1: 'No flights found for selected route/date',
            type: 'info',
            position: 'top',
          });
        }
      } else {
        Toast.show({
          text1: response.data.message || 'Failed to fetch flights',
          type: 'error',
          position: 'top',
        });
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Something went wrong while fetching flights';
      Toast.show({
        text1: msg,
        type: 'error',
        position: 'top',
      });
    } finally {
      setLoader(false);
    }
  };

  const fetchAgentDetails = async (id: number) => {
    try {
      const response: GlobalResponseType<{
        status: boolean;
        data: any;
      }> = await postData({
        url: endpoints.GET_AGENT_DETAILS_BY_ID,
        body: {
          agent_id: id,
        },
      });

      if (response?.status === 200 && response?.data?.status) {
        setUser(response?.data?.data);
      }
    } catch (error) {
      console.error('Error fetching agent details:', error);
    }
  };

  const getTwoMonthsofAvailablePNR = async (
    origin_apt: string,
    destin_apt: string,
  ) => {
    try {
      const response: GlobalResponseType<{
        status: boolean;
        result: any[];
      }> = await postData({
        url: endpoints.GET_TWO_MONTHS_AVALIABLE_PNR,
        body: {
          origin_apt,
          destin_apt,
        },
      });
      if (response.status === 200 && response.data.status) {
        setAvailablePnrDates(response.data.result);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const userDataStr = await AsyncStorage.getItem('userData');
        if (userDataStr) {
          setAgentData(JSON.parse(userDataStr));
        }
      } catch (error) {
        console.error('Error loading data from AsyncStorage:', error);
      }
    };
    loadData();
    getAirlines();
  }, []);

  useEffect(() => {
    if (agentData?.id) {
      fetchAgentDetails(agentData?.id);
    }
  }, [agentData?.id]);

  useEffect(() => {
    getTwoMonthsofAvailablePNR(watch('origin'), watch('destination'));
  }, [watch('origin'), watch('destination')]);

  return (
    <View>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.menuIcon}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <Icon name="menu" size={28} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{agentData?.application_header_name}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.container}>
          <View style={styles.row_design}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Main Balance</Text>
              <Text style={styles.cardAmount}>INR {user?.main_bal}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Credit Limit</Text>
              <Text style={styles.cardAmount}>INR {user?.credit_limit}</Text>
            </View>
          </View>

          <Controller
            control={control}
            name="origin"
            render={({ field: { value, onChange } }) => (
              <AirportSelector
                label="Origin"
                value={value}
                onChange={onChange}
                icon={require('../../../assets/arrival.png')}
              />
            )}
          />
          {errors.origin && (
            <Text style={styles.error}>{errors.origin.message}</Text>
          )}

          <View>
            <View style={styles.swapIconContainer}>
              <TouchableOpacity onPress={swapFields}>
                <Ionicons name="swap-vertical" size={22} color="#444" />
              </TouchableOpacity>
            </View>
          </View>

          <Controller
            control={control}
            name="destination"
            render={({ field: { value, onChange } }) => (
              <AirportSelector
                label="Destination"
                value={value}
                onChange={onChange}
                icon={require('../../../assets/desc.png')}
              />
            )}
          />
          {errors.destination && (
            <Text style={styles.error}>{errors.destination.message}</Text>
          )}
          <Text style={styles.sectionLabel}>Departure Date</Text>
          <View style={styles.inputCard}>
            <Ionicons name="calendar-outline" size={22} color="#444" />
            <TouchableOpacity
              onPress={() => setShowCalendar(!showCalendar)}
              style={{ flex: 1 }}
            >
              <Controller
                control={control}
                name="departureDate"
                render={({ field: { value } }) => (
                  <TextInput
                    style={styles.dateInput}
                    placeholder="DD/MM/YYYY"
                    value={value}
                    editable={false}
                    placeholderTextColor={'black'}
                  />
                )}
              />
            </TouchableOpacity>
          </View>

          {showCalendar && (
            <CalendarList
              onDayPress={handleDayPress}
              pastScrollRange={0}
              futureScrollRange={2}
              horizontal
              pagingEnabled
              theme={{
                todayTextColor: '#007AFF',
                selectedDayBackgroundColor: '#007AFF',
                selectedDayTextColor: 'white',
                arrowColor: '#007AFF',
              }}
              markedDates={{
                ...greenMarkedDates,
                ...(watchedDepartureDate
                  ? {
                      [watchedDepartureDate]: {
                        selected: true,
                        selectedColor: '#007AFF',
                        selectedTextColor: 'white',
                      },
                    }
                  : {}),
              }}
            />
          )}
          {errors.departureDate && (
            <Text style={styles.error}>{errors.departureDate.message}</Text>
          )}
          <Text style={styles.sectionLabel}>Traveller</Text>
          <View style={styles.inputCard}>
            <Ionicons name="airplane-outline" size={22} color="#444" />
            <TouchableOpacity
              onPress={() => setShowTravellerModal(true)}
              style={{ flex: 1 }}
            >
              <Controller
                control={control}
                name="travellers"
                render={({ field: { value } }) => (
                  <View pointerEvents="none" style={styles.inputColumn}>
                    <TextInput
                      style={styles.inputTitle}
                      placeholder="Travellers"
                      value={`${value.adults} Adult${
                        value.adults > 1 ? 's' : ''
                      }, ${value.children} Child${
                        value.children > 1 ? 'ren' : ''
                      }, ${value.infants} Infant${
                        value.infants > 1 ? 's' : ''
                      }`}
                      editable={false}
                    />
                  </View>
                )}
              />
            </TouchableOpacity>
          </View>
          <Modal
            transparent={true}
            visible={showTravellerModal}
            animationType="slide"
            onRequestClose={() => setShowTravellerModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Travellers</Text>

                {(
                  ['adults', 'children', 'infants'] as (keyof Travellers)[]
                ).map(type => (
                  <View style={styles.row} key={type}>
                    <Text style={styles.label}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>

                    <View style={styles.counter}>
                      <TouchableOpacity
                        onPress={() => {
                          const current = getValues('travellers');
                          handleTravellerChange(
                            type,
                            Number(current[type]) - 1,
                          );
                        }}
                        style={styles.counterButton}
                      >
                        <Text style={styles.counterText}>-</Text>
                      </TouchableOpacity>

                      <Text style={styles.count}>
                        {watch('travellers')[type]}
                      </Text>

                      <TouchableOpacity
                        onPress={() => {
                          const current = getValues('travellers');
                          handleTravellerChange(
                            type,
                            Number(current[type]) + 1,
                          );
                        }}
                        style={styles.counterButton}
                      >
                        <Text style={styles.counterText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={() => setShowTravellerModal(false)}
                >
                  <Text style={styles.doneText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <TouchableOpacity
            style={styles.searchButtonMain}
            onPress={handleSubmit(onSubmit)}
            disabled={loader}
          >
            {loader ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.searchButtonText}>Search</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    margin: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
    backgroundColor: '#e68725',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterButton: {
    backgroundColor: '#007AFF',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  counterText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  count: {
    fontSize: 16,
    marginHorizontal: 10,
  },
  doneButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 20,
  },
  doneText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  row_design: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  card: {
    width: '48%',
    backgroundColor: '#2F80ED',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },

  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  cardAmount: {
    color: '#fff',
    marginTop: 4,
    fontSize: 18,
    fontWeight: 'bold',
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 50,
  },

  searchButton: {
    backgroundColor: '#F2994A',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },

  searchText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },

  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: '#fff',
  },
  sectionLabel: {
    fontSize: 14,
    color: '#777',
    marginBottom: 5,
    marginLeft: 5,
  },
  inputCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },

  leftIcon: {
    marginRight: 10,
  },

  inputColumn: {
    flexDirection: 'column',
  },

  inputTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },

  inputSub: {
    fontSize: 13,
    color: '#777',
  },

  codeText: {
    fontSize: 14,
    color: '#444',
    fontWeight: '600',
    marginLeft: 6,
  },

  swapIconContainer: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -12 }],
  },

  dateInput: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 10,
  },

  searchButtonMain: {
    backgroundColor: '#F2994A',
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 18,
  },
  dropdownStyle: {
    paddingHorizontal: 10,
  },
  error: {
    color: 'red',
    marginBottom: 8,
    marginLeft: 6,
  },
  headerContainer: {
    height: 60,
    justifyContent: 'center',
    backgroundColor: '#e68725',
  },
  menuIcon: {
    position: 'absolute',
    left: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    alignSelf: 'center',
  },
});
