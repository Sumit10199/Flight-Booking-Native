import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Image,
} from 'react-native';
import { CalendarList } from 'react-native-calendars';
import { endpoints } from '../../utils/endpoints';
import { GlobalResponseType, postData } from '../../utils/axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

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

type TravellerType = 'adults' | 'children' | 'infants';

export default function FlightSearchForm() {
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTravellerModal, setShowTravellerModal] = useState(false);

  const [travellers, setTravellers] = useState<Travellers>({
    adults: 1,
    children: 0,
    infants: 0,
  });

  const handleDayPress = (day: any) => {
    setDepartureDate(day.dateString);
    setShowCalendar(false);
  };

  const handleTravellerChange = (type: TravellerType, value: number) => {
    setTravellers(prev => ({
      ...prev,
      [type]: Math.max(0, value),
    }));
  };

  const handleSearch = async () => {
    console.log({
      fromCity,
      toCity,
      departureDate,
      travellers,
    });

    const response: GlobalResponseType<Response> = await postData({
      url: endpoints.GET_FLIGHT_LIST,
      body: {
        origin_apt: fromCity,
        destin_apt: toCity,
        boarding_date: departureDate,
        seats: travellers,
        type: 'single',
      },
    });
    if (response.status === 200 && response.data.status) {
      console.log('response', response);
    }
    // Call your API or navigate to results
  };

  return (
    <ScrollView>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>SMT Travel Agency</Text>
      </View>

      <View style={styles.container}>
        <View style={styles.row_design}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Main Balance</Text>
            <Text style={styles.cardAmount}>INR 4,523</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Credit Limit</Text>
            <Text style={styles.cardAmount}>INR 4,523</Text>
          </View>
        </View>
        <View style={styles.searchRow}>
          <TouchableOpacity style={styles.searchButton}>
            <Text style={styles.searchText}>Search</Text>
          </TouchableOpacity>

          <TextInput
            placeholder="Search by code"
            style={styles.searchInput}
            placeholderTextColor="#888"
          />
        </View>

        <View>
          {/* Origin */}
          <Text style={styles.sectionLabel}>Origin</Text>
          <View style={styles.inputCard}>
            <Image source={require("../../../assets/arrival.png")} />
            <View style={styles.inputColumn}>
              <TextInput
                style={styles.inputTitle}
                placeholder="Search for an airport..."
                placeholderTextColor="#aaa"
              />
            </View>
          </View>
          <View>
            <View style={styles.swapIconContainer}>
              <Ionicons name="swap-vertical" size={22} color="#444" />
            </View>
          </View>
          <Text style={styles.sectionLabel}>Destination</Text>
          <View style={styles.inputCard}>
            <Image source={require("../../../assets/desc.png")} />
            <View style={styles.inputColumn}>
              <TextInput
                style={styles.inputTitle}
                placeholder="Search for an airport..."
                placeholderTextColor="#aaa"
              />
            </View>
          </View>
          <Text style={styles.sectionLabel}>Departure Date</Text>
          <View style={styles.inputCard}>
            <Ionicons name="calendar-outline" size={22} color="#444" />
            <TextInput style={styles.dateInput} placeholder="DD/MM/YYYY"   value={departureDate}
              editable={false} />
          </View>
          <Text style={styles.sectionLabel}>Traveller</Text>
          <View style={styles.inputCard}>
            <Ionicons name="airplane-outline" size={22} color="#444" />
             <TouchableOpacity onPress={() => setShowTravellerModal(true)}>
          <View pointerEvents="none" style={styles.inputColumn}>
            <TextInput
              style={styles.inputTitle}
              placeholder="Travellers"
              value={`${travellers.adults} Adult${
                travellers.adults > 1 ? 's' : ''
              }, ${travellers.children} Child${
                travellers.children > 1 ? 'ren' : ''
              }, ${travellers.infants} Infant${
                travellers.infants > 1 ? 's' : ''
              }`}
              editable={false}
            />
          </View>
        </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.searchButtonMain}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
        

        {/* <TextInput
          style={styles.input}
          placeholder="From City"
          value={fromCity}
          onChangeText={setFromCity}
        /> */}

        {/* <TextInput
          style={styles.input}
          placeholder="To City"
          value={toCity}
          onChangeText={setToCity}
        />

        <TouchableOpacity onPress={() => setShowCalendar(!showCalendar)}>
          <View pointerEvents="none">
            <TextInput
              style={styles.input}
              placeholder="Select Departure Date"
              value={departureDate}
              editable={false}
            />
          </View>
        </TouchableOpacity>

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
            markedDates={
              departureDate
                ? {
                    [departureDate]: {
                      selected: true,
                      selectedColor: '#007AFF',
                    },
                  }
                : {}
            }
          />
        )}
        <TouchableOpacity onPress={() => setShowTravellerModal(true)}>
          <View pointerEvents="none">
            <TextInput
              style={styles.input}
              placeholder="Travellers"
              value={`${travellers.adults} Adult${
                travellers.adults > 1 ? 's' : ''
              }, ${travellers.children} Child${
                travellers.children > 1 ? 'ren' : ''
              }, ${travellers.infants} Infant${
                travellers.infants > 1 ? 's' : ''
              }`}
              editable={false}
            />
          </View>
        </TouchableOpacity>
        <Modal
          transparent={true}
          visible={showTravellerModal}
          animationType="slide"
          onRequestClose={() => setShowTravellerModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Travellers</Text>

              {(['adults', 'children', 'infants'] as const).map(type => (
                <View style={styles.row} key={type}>
                  <Text style={styles.label}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                  <View style={styles.counter}>
                    <TouchableOpacity
                      onPress={() =>
                        handleTravellerChange(
                          type,
                          Number(travellers[type]) - 1,
                        )
                      }
                      style={styles.counterButton}
                    >
                      <Text style={styles.counterText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.count}>{travellers[type]}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        handleTravellerChange(type, travellers[type] + 1)
                      }
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
        <TouchableOpacity style={styles.button} onPress={handleSearch}>
          <Text style={styles.buttonText}>Search Flights</Text>
        </TouchableOpacity> */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    // backgroundColor: '#fff',
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
  headerContainer: {
    backgroundColor: '#e68725',
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginBottom: 20,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },

  row_design: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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

  /** ========================
   *  INPUT CARD
   ========================== */
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

  /** ========================
   *  SWAP ICON (between origin & destination)
   ========================== */
  swapIconContainer: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -12 }],
  },

  /** ========================
   * DATE INPUT
   ========================== */
  dateInput: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 10,
  },

  /** ========================
   * MAIN SEARCH BUTTON
   ========================== */
  searchButtonMain: {
    backgroundColor: '#F2994A',
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
    width: '100%',
  },

  searchButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 18,
  },
});
