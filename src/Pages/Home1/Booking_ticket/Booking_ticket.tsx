import { useEffect, useMemo, useState } from 'react';

import {
  calculateTotalPrice,
  transformBookingDataAIrIQ,
  transformBookingDataEASE2FLY,
  transformBookingDataTravelogy,
} from './extraFunctions';
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  Linking,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Checkbox } from 'react-native-paper';
import dayjs from 'dayjs';
import {
  FlightPNR,
  FormValues,
  Passenger,
  PassengerType,
  PaymentModule,
} from '../types';
import { GlobalResponseType, postData } from '../../../utils/axios';
import { endpoints } from '../../../utils/endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dropdown } from 'react-native-element-dropdown';

function BookingTicket() {
  const [loader, setLoader] = useState(false);
  const [paymentModule, setPaymentModule] = useState<PaymentModule[]>([]);
  const [toggle, setToggle] = useState<boolean>();
  const [airlines, setAirlines] = useState<
    {
      airline_name: string;
      airline_code: string;
      airline_logo: string;
    }[]
  >([]);
  const [agentData, setAgentData] = useState<any>(null);
  const [seatsStringRaw, setSeatsStringRaw] = useState<string>('');
  const [flightDetails, setFlightDetails] = useState<FlightPNR | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userDataStr = await AsyncStorage.getItem('userData');
        if (userDataStr) {
          setAgentData(JSON.parse(userDataStr));
        }
        const travellerStr = await AsyncStorage.getItem('traveller');
        setSeatsStringRaw(travellerStr ?? '');
        const storedFlightStr = await AsyncStorage.getItem('booking_flight');
        if (storedFlightStr) {
          setFlightDetails(JSON.parse(storedFlightStr));
        }
      } catch (error) {
        console.error('Error loading data from AsyncStorage:', error);
      }
    };
    loadData();
  }, []);

  const initialPassengers = useMemo(() => {
    const arr: Passenger[] = [];
    if (!seatsStringRaw) return arr;

    const regex = /(\d+)\s*(Adult|Adults|Child|Children|Infant|Infants)/gi;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(seatsStringRaw)) !== null) {
      const num = parseInt(match[1], 10);
      const rawType = match[2];
      const type = normalizeType(rawType) as PassengerType | null;
      if (!type) continue;
      for (let i = 0; i < num; i++) {
        arr.push({
          type,
          title: 'Mr.',
          firstName: '',
          lastName: '',
          needWheelchair: 'NO',
        });
      }
    }
    return arr;
  }, [seatsStringRaw]);

  const grouped = useMemo(() => {
    const map: Record<PassengerType, Passenger[]> = {
      Adult: [],
      Child: [],
      Infant: [],
    };
    initialPassengers.forEach(p => map[p.type].push(p));
    return map;
  }, [initialPassengers]);

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<FormValues>({
    defaultValues: {
      passengers: initialPassengers,
      mobile_no: '',
      email_id: '',
      display_price: '',
      payment_mode: '',
      total_price: '0',
    },
  });

  const firstSeg = flightDetails?.segments?.[0];
  const lastSeg = flightDetails?.segments?.[flightDetails.segments?.length - 1];
  const displayPrice = watch('display_price');
  function normalizeType(raw: string | undefined): PassengerType | null {
    if (!raw) return null;
    const t = raw.toLowerCase();
    if (t.startsWith('adult')) return 'Adult';
    if (t.startsWith('child')) return 'Child';
    if (t.startsWith('infant')) return 'Infant';
    return null;
  }
  const onSubmit = async (data: FormValues) => {
    setLoader(true);

    const out_book_data =
      flightDetails?.outside_api_provider === 'TRAVELOGY'
        ? transformBookingDataTravelogy(flightDetails, agentData)
        : flightDetails?.outside_api_provider === 'AIR_IQ'
        ? transformBookingDataAIrIQ(data, flightDetails)
        : flightDetails?.outside_api_provider === 'EASE2FLY'
        ? transformBookingDataEASE2FLY(data, flightDetails)
        : null;

    try {
      const response: GlobalResponseType<{
        status: boolean;
        message: string;
        booking_id?: number;
      }> = await postData({
        url: endpoints.AGENT_FLIGHT_BOOKING_REQUEST,
        body: {
          id: data?.id,
          agent_id: agentData?.id,
          pnr_no: flightDetails?.pnr_no,
          pnr_id: flightDetails?.pnr_id,
          booking_phone: data.mobile_no,
          booking_email: data.email_id,
          display_fare_price: data.display_price,
          booking_price: data.total_price,
          payment_method: data.payment_mode,
          travellers: seatsStringRaw,
          pax_data: data.passengers,
          supplier_id: flightDetails?.supplier_id || null,
          outside_api_provider: flightDetails?.outside_api_provider || null,
          outside_api_provider_ticket_id: flightDetails?.ticket_id || null,
          outside_booking_data: JSON.stringify(out_book_data),
          booking_data: JSON.stringify(flightDetails),
        },
      });

      if (response.status === 200 && response.data.status) {
        if (response.data.booking_id) {
          let checkoutUrl;
          if (Number(data.payment_gateway) === 1) {
            checkoutUrl = await generatePhonePeUrl(
              parseFloat(data.total_price) * 100,
              response.data.booking_id,
            );
          } else if (Number(data.payment_gateway) === 2) {
            checkoutUrl = await cashFreePayment_createGateway(
              parseFloat(data.total_price),
              response.data.booking_id,
            );
          } else if (Number(data.payment_gateway) === 3) {
            await atomPayment_createGateway(
              parseFloat(data.total_price),
              response.data.booking_id,
            );
            return;
          }
        }
      } else {
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoader(false);
    }
  };

  const generatePhonePeUrl = async (amount: number, booking_id: number) => {
    try {
      const response: GlobalResponseType<{
        status: boolean;
        url: { redirectUrl: string };
      }> = await postData({
        url: endpoints.GENERATE_PHONEPE_URL,
        body: { amount, book_id: booking_id },
      });
      if (response.status === 200 && response.data.status) {
        return response.data.url.redirectUrl;
      }
    } catch (error) {
      throw error;
    }
  };

  const cashFreePayment_createGateway = async (
    amount: number,
    booking_id: number,
  ) => {
    try {
      const response: GlobalResponseType<{
        status: boolean;
        url: string;
      }> = await postData({
        url: endpoints?.AGENT_CREATE_CASHDREE_PAYMENT_GATEWAY,
        body: {
          amount: amount,
          book_id: booking_id,
          purpose: 'Booking',
          customer: {
            phone: agentData.mobile_no,
            email: agentData?.email_id,
            name: `${agentData?.first_name} ${agentData?.last_name}`,
          },
        },
      });
      if (response.status === 200 && response.data.status) {
        return response.data.url;
      }
    } catch (error) {
      console.error(error);
    }
  };
  const atomPayment_createGateway = async (
    amount: number,
    booking_id: number,
  ) => {
    try {
      const response: GlobalResponseType<{
        status: boolean;
        result: string;
      }> = await postData({
        url: endpoints?.AGENT_CREATE_ATOM_PAYMENT_GATEWAY,
        body: {
          amount,
          booking_id,
          agent_id: agentData.id,
        },
      });
      if (response.status === 200 && response.data.status) {
        // paymentWindow?.document.open();
        // paymentWindow?.document.write(response.data.result ?? "<></>");
        // paymentWindow?.document.close();
      }
    } catch (error) {
      console.error(error);
    }
  };

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
    } catch (error) {
      throw error;
    }
  };

  const requirements: string[] = flightDetails?.requirements
    ? JSON.parse(flightDetails.requirements)
    : [];

  const isDobRequired = (type: PassengerType) => {
    if (flightDetails?.isinternational) return true;
    if (type === 'Adult') return requirements.includes('require_dob_adt');
    if (type === 'Child') return requirements.includes('require_dob_chd');
    if (type === 'Infant') return requirements.includes('require_dob_inf');
    return false;
  };

  const isFLightInternational = () => {
    if (flightDetails?.isinternational) return true;
  };
  const isPassportRequired = (type: PassengerType) => {
    if (flightDetails?.isinternational) return true;
    if (type === 'Adult') return requirements.includes('require_passport_adt');
    if (type === 'Child') return requirements.includes('require_passport_chd');
    if (type === 'Infant') return requirements.includes('require_passport_inf');
    return false;
  };

  const getpaymentModule = async () => {
    try {
      const response: GlobalResponseType<{
        status: boolean;
        result: [];
      }> = await postData({
        url: endpoints.GET_AGENT_PAYMENT_MODULE,
        body: {},
      });
      if (response.status === 200 && response.data.status) {
        setPaymentModule(response.data.result);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getpaymentModule();
    getAirlines();
  }, []);

  useEffect(() => {
    const calculatedTotal = calculateTotalPrice(flightDetails, seatsStringRaw);
    let payable = calculatedTotal;
    if (displayPrice) {
      const discount = parseFloat(displayPrice);
      if (!isNaN(discount)) payable = calculatedTotal;
    }
    if (watch('total_price') !== payable.toString()) {
      setValue('total_price', payable.toString(), { shouldValidate: false });
    }
  }, [seatsStringRaw, flightDetails, displayPrice, setValue, watch]);

  return (
    <ScrollView style={styles.container}>
      {/* <View style={styles.card}>
        <Text style={styles.routeTitle}>
          {firstSeg?.origin} - {lastSeg?.destination}{' '}
          {firstSeg ? dayjs(firstSeg.depDate).format('ddd, DD MMM, YYYY') : ''}
        </Text>
        <View style={styles.rowBetween}>
          <Text style={styles.onwardText}>✈ Onward</Text>

          <View style={{ alignItems: 'flex-end' }}>
            {flightDetails?.fare_type && (
              <Text style={styles.fareRuleLink}>Fare Rules</Text>
            )}
            <Text style={styles.fareTypeText}>{flightDetails?.fare_type}</Text>
          </View>
        </View>
         <View style={styles.airlineLogoBox}>
              <Image
                source={{ uri: firstSeg?.airline_logo }}
                style={styles.airlineLogo}
              />
            </View>
       <View>
         <View style={styles.airlineRow}>
          <View style={styles.row}>
           

            <Text style={styles.airlineName}>
              {firstSeg?.airline_name}
              {'\n'}
              {firstSeg?.flightNo}
            </Text>
          </View>

          <View style={styles.segmentRow}>
           <View style={{ alignItems: 'flex-start' }}>
              <Text>
                {dayjs(firstSeg?.depDate).format('ddd, DD MMM, YYYY')}
              </Text>
              <Text>
                {firstSeg?.origin} {firstSeg?.depTime}
              </Text>
              <Text>Terminal- {'N/A'}</Text>
            </View>

            <View style={{ alignItems: 'center' }}>
              <Text>Non - Stop</Text>
              <Text style={{ fontSize: 26 }}>✈</Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text>{dayjs(lastSeg?.arrDate).format('ddd, DD MMM, YYYY')}</Text>
              <Text>
                {lastSeg?.destination} {lastSeg?.arrTime}
              </Text>
              <Text>Terminal- {'N/A'}</Text>
            </View>
          </View>
        </View>
       </View>
        <TouchableOpacity
          onPress={() => setToggle(!toggle)}
          style={styles.toggleButton}
        >
          <Text style={styles.toggleButtonText}>Flight Details</Text>
        </TouchableOpacity>
      </View> */}
      <View style={styles.card}>

  {/* Route Title */}
  <Text style={styles.routeTitle}>
    {firstSeg?.origin} - {lastSeg?.destination}{' '}
    {firstSeg ? dayjs(firstSeg.depDate).format('ddd, DD MMM, YYYY') : ''}
  </Text>

  {/* Onward + Fare Rules */}
  <View style={styles.rowBetween}>
    <Text style={styles.onwardText}>✈ Onward</Text>

    <View style={{ alignItems: 'flex-end' }}>
      {flightDetails?.fare_type && (
        <Text style={styles.fareRuleLink}>Fare Rules</Text>
      )}
      <Text style={styles.fareTypeText}>{flightDetails?.fare_type}</Text>
    </View>
  </View>

  {/* Airline Row */}
  <View style={styles.airlineRow}>

    {/* Airline Logo */}
    <Image
      source={{ uri: firstSeg?.airline_logo }}
      style={styles.airlineLogo}
    />

    {/* Airline Name + Number */}
    <View style={{ marginLeft: 12 }}>
      <Text style={styles.airlineName}>
        {firstSeg?.airline_name}
      </Text>
      <Text style={styles.flightNo}>{firstSeg?.flightNo}</Text>
    </View>

  </View>

  {/* FULL MIDDLE ROW */}
  <View style={styles.segmentContainer}>

    {/* LEFT — Origin */}
    <View style={{ alignItems: 'flex-start' }}>
      <Text style={styles.dateText}>
        {dayjs(firstSeg?.depDate).format('ddd, DD MMM, YYYY')}
      </Text>
      <Text style={styles.timeText}>
        {firstSeg?.origin} {firstSeg?.depTime}
      </Text>
      <Text style={styles.terminalText}>Terminal- N/A</Text>
    </View>

    {/* CENTER — Icon */}
    <View style={styles.centerBox}>
      <Text style={styles.nonStopText}>Non - Stop</Text>
      <Text style={styles.planeIcon}>✈</Text>
    </View>

    {/* RIGHT — Destination */}
    <View style={{ alignItems: 'flex-end' }}>
      <Text style={styles.dateText}>
        {dayjs(lastSeg?.arrDate).format('ddd, DD MMM, YYYY')}
      </Text>
      <Text style={styles.timeText}>
        {lastSeg?.destination} {lastSeg?.arrTime}
      </Text>
      <Text style={styles.terminalText}>Terminal- N/A</Text>
    </View>

  </View>

  {/* Flight Details Button */}
  <TouchableOpacity
    onPress={() => setToggle(!toggle)}
    style={styles.toggleButton}
  >
    <Text style={styles.toggleButtonText}>Flight Details</Text>
  </TouchableOpacity>

</View>

      {toggle && (
        <View style={styles.card}>
          {flightDetails?.segments?.map((s, index) => {
            const logo_segemnt = airlines?.find(
              item => item.airline_code === s.airline_code,
            );

            const airline_logo_segemnt =
              s?.airline_logo ?? logo_segemnt?.airline_logo;
            return (
              <View key={index} style={styles.segmentBox}>
                <View style={styles.rowBetween}>
                  <View>
                    <Image
                      source={{ uri: airline_logo_segemnt }}
                      style={styles.airlineLogo}
                    />
                    <Text style={styles.flightNo}>{s.flightNo}</Text>
                  </View>
                </View>

                <View style={styles.routeContainer}>
                  <View style={{ alignItems: 'flex-start', marginTop: 10 }}>
                    <Text style={styles.timeText}>
                      {s.depTime?.replace('HRS', '')}
                    </Text>
                    <Text style={styles.dateText}>
                      {dayjs(s.depDate).format('DD MMM YYYY')}
                    </Text>
                    <Text style={styles.cityText}>{s.origin}</Text>
                  </View>
                  <View style={styles.dot} />
                  <View style={styles.dottedLine} />
                  <View style={styles.dot} />
                  <View style={[styles.rowBetween, { marginTop: 10 }]}>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.timeText}>
                        {s.arrTime?.replace('HRS', '')}
                      </Text>
                      <Text style={styles.dateText}>
                        {dayjs(s.arrDate).format('DD MMM YYYY')}
                      </Text>
                      <Text style={styles.cityText}>{s.destination}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.baggageCard}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.label}>Cabin</Text>
                    <Text>{s.cabin_baggage || '-'}</Text>
                  </View>
                  <View style={styles.rowBetween}>
                    <Text style={styles.label}>Check-in</Text>
                    <Text>{s.baggage || '-'}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <ScrollView style={{ flex: 1, padding: 15, backgroundColor: '#f5f5f5' }}>
        {(['Adult', 'Child', 'Infant'] as PassengerType[]).map(type => {
          const list = grouped[type];
          if (!list || list.length === 0) return null;

          return (
            <View
              key={type}
              style={{
                backgroundColor: '#fff',
                padding: 15,
                borderRadius: 10,
                marginBottom: 15,
                elevation: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  marginBottom: 10,
                  textAlign: 'center',
                }}
              >
                {type}
                {list.length > 1 ? 's' : ''}
              </Text>

              {list.map((_, relIndex) => {
                let index = 0;
                if (type === 'Adult') index = relIndex;
                else if (type === 'Child')
                  index = grouped.Adult.length + relIndex;
                else
                  index =
                    grouped.Adult.length + grouped.Child.length + relIndex;

                return (
                  <View
                    key={`${type}-${relIndex}`}
                    style={{ marginBottom: 15 }}
                  >
                    <Controller
                      control={control}
                      name={`passengers.${index}.title`}
                      render={({ field: { onChange, value } }) => {
                        const options =
                          type === 'Child' || type === 'Infant'
                            ? [
                                { label: 'Master', value: 'Mstr.' },
                                { label: 'Miss', value: 'Miss' },
                              ]
                            : [
                                { label: 'Mr.', value: 'Mr.' },
                                { label: 'Mrs.', value: 'Mrs.' },
                                { label: 'Ms.', value: 'Ms.' },
                              ];

                        const defaultValue =
                          value ||
                          (type === 'Child' || type === 'Infant'
                            ? 'Mstr.'
                            : 'Mr.');

                        return (
                          <Dropdown
                            style={styles.dropdown}
                            placeholder="Select Title"
                            placeholderStyle={{ color: '#888' }}
                            selectedTextStyle={{ color: '#000' }}
                            data={options}
                            labelField="label"
                            valueField="value"
                            value={defaultValue}
                            onChange={item => onChange(item.value)}
                          />
                        );
                      }}
                    />
                    <Controller
                      control={control}
                      name={`passengers.${index}.firstName` as const}
                      rules={{ required: 'First name is required' }}
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          style={{
                            borderWidth: 1,
                            borderColor: '#ccc',
                            borderRadius: 8,
                            padding: 10,
                            marginVertical: 5,
                          }}
                          placeholder="First Name"
                          placeholderTextColor={'black'}
                          value={value}
                          onChangeText={onChange}
                        />
                      )}
                    />
                    {errors.passengers?.[index]?.firstName && (
                      <Text style={{ color: 'red', fontSize: 12 }}>
                        {errors.passengers[index]?.firstName?.message}
                      </Text>
                    )}
                    <Controller
                      control={control}
                      name={`passengers.${index}.lastName` as const}
                      rules={{ required: 'Last name is required' }}
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          style={{
                            borderWidth: 1,
                            borderColor: '#ccc',
                            borderRadius: 8,
                            padding: 10,
                            marginVertical: 5,
                          }}
                          placeholder="Last Name"
                          value={value}
                          onChangeText={onChange}
                          placeholderTextColor={'black'}
                        />
                      )}
                    />
                    {errors.passengers?.[index]?.lastName && (
                      <Text style={{ color: 'red', fontSize: 12 }}>
                        {errors.passengers[index]?.lastName?.message}
                      </Text>
                    )}

                    <Controller
                      control={control}
                      name={`passengers.${index}.needWheelchair`}
                      render={({ field: { onChange, value } }) => {
                        const wheelchairOptions = [
                          { label: 'No', value: 'NO' },
                          { label: 'Yes', value: 'YES' },
                        ];

                        return (
                          <Dropdown
                            style={styles.dropdown}
                            data={wheelchairOptions}
                            labelField="label"
                            valueField="value"
                            placeholder="Need Wheelchair?"
                            placeholderStyle={{ color: '#888' }}
                            selectedTextStyle={{ color: '#000' }}
                            value={value}
                            onChange={item => onChange(item.value)}
                          />
                        );
                      }}
                    />

                    {isDobRequired(type) && (
                      <Controller
                        control={control}
                        name={`passengers.${index}.dob` as const}
                        rules={{ required: 'Date of birth is required' }}
                        render={({ field: { onChange, value } }) => (
                          <TextInput
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor={'black'}
                            style={{
                              borderWidth: 1,
                              borderColor: '#ccc',
                              borderRadius: 8,
                              padding: 10,
                              marginVertical: 5,
                            }}
                            value={value}
                            onChangeText={onChange}
                          />
                        )}
                      />
                    )}

                    {isPassportRequired(type) && (
                      <Controller
                        control={control}
                        name={`passengers.${index}.passportNo` as const}
                        rules={{ required: 'Passport No is required' }}
                        render={({ field: { onChange, value } }) => (
                          <TextInput
                            placeholder="Passport No"
                            placeholderTextColor={'black'}
                            style={{
                              borderWidth: 1,
                              borderColor: '#ccc',
                              borderRadius: 8,
                              padding: 10,
                              marginVertical: 5,
                            }}
                            value={value}
                            onChangeText={onChange}
                          />
                        )}
                      />
                    )}

                    {isFLightInternational() && (
                      <>
                        <Controller
                          control={control}
                          name={
                            `passengers.${index}.passport_expirydate` as const
                          }
                          rules={{
                            required: 'Passport Expiry Date is required',
                          }}
                          render={({ field: { onChange, value } }) => (
                            <TextInput
                              placeholder="Expiry YYYY-MM-DD"
                              placeholderTextColor={'black'}
                              style={{
                                borderWidth: 1,
                                borderColor: '#ccc',
                                borderRadius: 8,
                                padding: 10,
                                marginVertical: 5,
                              }}
                              value={value}
                              onChangeText={onChange}
                            />
                          )}
                        />
                        <Controller
                          control={control}
                          name={
                            `passengers.${index}.passport_issuing_country_code` as const
                          }
                          rules={{ required: 'Country Code is required' }}
                          render={({ field: { onChange, value } }) => (
                            <TextInput
                              placeholder="Country Code"
                              placeholderTextColor={'black'}
                              style={{
                                borderWidth: 1,
                                borderColor: '#ccc',
                                borderRadius: 8,
                                padding: 10,
                                marginVertical: 5,
                              }}
                              value={value}
                              onChangeText={onChange}
                            />
                          )}
                        />
                        <Controller
                          control={control}
                          name={`passengers.${index}.nationality` as const}
                          rules={{ required: 'Nationality is required' }}
                          render={({ field: { onChange, value } }) => (
                            <TextInput
                              placeholder="Nationality"
                              placeholderTextColor={'black'}
                              style={{
                                borderWidth: 1,
                                borderColor: '#ccc',
                                borderRadius: 8,
                                padding: 10,
                                marginVertical: 5,
                              }}
                              value={value}
                              onChangeText={onChange}
                            />
                          )}
                        />
                      </>
                    )}
                  </View>
                );
              })}
            </View>
          );
        })}

        <View
          style={{
            backgroundColor: '#fff',
            padding: 15,
            borderRadius: 10,
            marginBottom: 15,
            elevation: 2,
          }}
        >
          <Controller
            control={control}
            name="mobile_no"
            rules={{
              required: 'Mobile number is required',
              pattern: {
                value: /^[0-9]{10}$/,
                message: 'Enter a valid 10-digit number',
              },
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="Mobile Number"
                keyboardType="number-pad"
                style={{
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 8,
                  padding: 10,
                  marginVertical: 5,
                }}
                value={value}
                placeholderTextColor={'black'}
                onChangeText={onChange}
              />
            )}
          />
          {errors.mobile_no && (
            <Text style={{ color: 'red', fontSize: 12 }}>
              {errors.mobile_no.message}
            </Text>
          )}

          <Controller
            control={control}
            name="email_id"
            rules={{
              required: 'Email is required',
              pattern: {
                value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                message: 'Enter a valid email',
              },
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="Email"
                keyboardType="email-address"
                placeholderTextColor={'black'}
                style={{
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 8,
                  padding: 10,
                  marginVertical: 5,
                }}
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors.email_id && (
            <Text style={{ color: 'red', fontSize: 12 }}>
              {errors.email_id.message}
            </Text>
          )}
          <Controller
            control={control}
            name="display_price"
            rules={{
              required: 'Display Fare Price is required',
              pattern: { value: /^[0-9]*$/, message: 'Must be a number' },
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="Display Price"
                placeholderTextColor={'black'}
                style={{
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 8,
                  padding: 10,
                  marginVertical: 5,
                }}
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors?.display_price && (
            <Text style={{ color: 'red', fontSize: 12 }}>
              {errors.display_price.message}
            </Text>
          )}
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>Payment Mode</Text>
          <Controller
            control={control}
            name="payment_mode"
            rules={{ required: 'Payment mode is required' }}
            render={({ field: { value, onChange } }) => (
              <View style={styles.radioContainer}>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    value === 'deposit' && styles.radioButtonSelected,
                  ]}
                  onPress={() => onChange('deposit')}
                >
                  <Text style={styles.radioLabel}>Deposit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    value === 'online' && styles.radioButtonSelected,
                  ]}
                  onPress={() => onChange('online')}
                >
                  <Text style={styles.radioLabel}>Online Payment</Text>
                </TouchableOpacity>
              </View>
            )}
          />
          {errors.payment_mode && (
            <Text style={styles.errorText}>{errors.payment_mode.message}</Text>
          )}
          {watch('payment_mode') === 'online' && (
            <Controller
              control={control}
              name="payment_gateway"
              rules={{ required: 'Please select a payment gateway' }}
              render={({ field: { onChange, value } }) => (
                <View style={{ marginTop: 10 }}>
                  <Text style={{ marginBottom: 5 }}>
                    Select Payment Gateway
                  </Text>

                  <Dropdown
                    style={styles.dropdown}
                    placeholder="-- Choose Gateway --"
                    placeholderStyle={{ color: '#888' }}
                    selectedTextStyle={{ color: '#000' }}
                    itemTextStyle={{ color: '#000' }}
                    data={paymentModule.map(gateway => ({
                      label: gateway.payment_module,
                      value: gateway.id,
                    }))}
                    labelField="label"
                    valueField="value"
                    value={value}
                    onChange={item => {
                      onChange(item.value);
                    }}
                  />

                  {errors.payment_gateway && (
                    <Text style={styles.errorText}>
                      {errors.payment_gateway.message}
                    </Text>
                  )}
                </View>
              )}
            />
          )}

          <Text style={styles.payable}>
            Payable Amount:{' '}
            <Text style={{ color: '#1d4ed8' }}>Rs. {watch('total_price')}</Text>
          </Text>
        </View>
        <Controller
          control={control}
          name="terms"
          rules={{ required: 'You must agree to the Terms & Conditions' }}
          render={({ field: { value, onChange } }) => (
            <View style={styles.termsContainer}>
              <Checkbox
                status={value ? 'checked' : 'unchecked'}
                onPress={() => onChange(!value)}
              />
              <Text style={styles.termsText}>
                Yes, I Agree To The{' '}
                <Text
                  style={{ color: 'blue' }}
                  onPress={() =>
                    Linking.openURL(
                      'https://travel24hrs.com/terms-and-condition',
                    )
                  }
                >
                  Terms & Conditions
                </Text>
              </Text>
            </View>
          )}
        />

        {errors.terms && (
          <Text style={styles.errorText}>{errors.terms.message}</Text>
        )}

        <TouchableOpacity
          style={{
            backgroundColor: '#1e40af',
            padding: 15,
            borderRadius: 8,
            alignItems: 'center',
            marginBottom: 20,
          }}
          onPress={handleSubmit(onSubmit)}
          disabled={loader}
        >
          {loader ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Book Now</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ScrollView>
  );
}

export default BookingTicket;

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6', padding: 12 },
 
  airlineLogoBox: {
    padding: 6,
    borderWidth: 2,
    borderColor: '#0040a8',
    borderRadius: 10,
  },

  segmentBox: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  segmentAirlineLogo: { width: 60, height: 25, resizeMode: 'contain' },
  segmentAirlineTitle: { marginTop: 5, fontWeight: '600' },
  airportName: { fontWeight: '600' },
  bold: { fontWeight: '700' },
  sectionTitle: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  passengerBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  field: { marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  radioRow: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  submitButton: {
    backgroundColor: '#0a195c',
    padding: 14,
    borderRadius: 8,
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  termsText: {
    marginLeft: 8,
    flexShrink: 1,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  radioButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  radioButtonSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#bfdbfe',
  },
  radioLabel: {
    fontSize: 16,
    color: '#374151',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
  },
  picker: {
    height: 45,
    width: '100%',
  },

  payable: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'right',
  },
  dropdown: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },


  cityText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#003E78',
  },

  routeContainer: {
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  dottedLine: {
    flex: 1,
    borderStyle: 'dotted',
    borderWidth: 1,
    borderColor: '#7C46FF',
    marginHorizontal: 5,
  },

  dot: {
    width: 10,
    height: 10,
    backgroundColor: '#7C46FF',
    borderRadius: 5,
  },

  baggageCard: {
    backgroundColor: '#EEF3FF',
    marginTop: 15,
    padding: 12,
    borderRadius: 10,
  },

  label: {
    fontWeight: '700',
    color: '#000',
  },
  segmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
    card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginVertical: 8,
    elevation: 3,
  },

  routeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  onwardText: {
    color: '#444',
    fontSize: 14,
  },

  fareRuleLink: {
    color: '#1A73E8',
    fontSize: 12,
    textDecorationLine: 'underline',
  },

  fareTypeText: {
    fontSize: 13,
    color: '#444',
  },

  airlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  airlineLogo: {
    width: 55,
    height: 55,
    resizeMode: 'contain',
  },

  airlineName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },

  flightNo: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },

  segmentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },

  dateText: {
    fontSize: 13,
    color: '#222',
    marginBottom: 2,
  },

  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    marginBottom: 2,
  },

  terminalText: {
    fontSize: 12,
    color: '#777',
  },

  centerBox: {
    alignItems: 'center',
  },

  nonStopText: {
    fontSize: 13,
    marginBottom: 2,
    color: '#444',
  },

  planeIcon: {
    fontSize: 28,
    color: '#333',
  },

  toggleButton: {
    backgroundColor: '#1A73E8',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },

  toggleButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },

});
