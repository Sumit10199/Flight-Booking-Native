import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { CalendarList } from 'react-native-calendars';
import { endpoints } from '../../utils/endpoints';
import { GlobalResponseType, postData } from '../../utils/axios';

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
    setTravellers((prev) => ({
      ...prev,
      [type]: Math.max(0, value),
    }));
  };

  const handleSearch = async() => {
    console.log({
      fromCity,
      toCity,
      departureDate,
      travellers,
    });


    const response: GlobalResponseType<Response> =
      await postData({
        url: endpoints.GET_FLIGHT_LIST,
        body: {
          origin_apt: fromCity,
          destin_apt: toCity,
          boarding_date: departureDate,
          seats: travellers,
          type: "single",
        },
      });
    if (response.status === 200 && response.data.status) {
      console.log('response', response);

    }
    // Call your API or navigate to results
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Flight Search</Text>

      {/* From City */}
      <TextInput
        style={styles.input}
        placeholder="From City"
        value={fromCity}
        onChangeText={setFromCity}
      />

      {/* To City */}
      <TextInput
        style={styles.input}
        placeholder="To City"
        value={toCity}
        onChangeText={setToCity}
      />

      {/* Departure Date */}
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
              ? { [departureDate]: { selected: true, selectedColor: '#007AFF' } }
              : {}
          }
        />
      )}

      {/* Travellers */}
      <TouchableOpacity onPress={() => setShowTravellerModal(true)}>
        <View pointerEvents="none">
          <TextInput
            style={styles.input}
            placeholder="Travellers"
            value={`${travellers.adults} Adult${travellers.adults > 1 ? 's' : ''}, ${travellers.children
              } Child${travellers.children > 1 ? 'ren' : ''}, ${travellers.infants} Infant${travellers.infants > 1 ? 's' : ''
              }`}
            editable={false}
          />
        </View>
      </TouchableOpacity>

      {/* Traveller Modal */}
      <Modal
        transparent={true}
        visible={showTravellerModal}
        animationType="slide"
        onRequestClose={() => setShowTravellerModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Travellers</Text>

            {(['adults', 'children', 'infants'] as const).map((type) => (
              <View style={styles.row} key={type}>
                <Text style={styles.label}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
                <View style={styles.counter}>
                  <TouchableOpacity
                    onPress={() =>
                      handleTravellerChange(type, (Number(travellers[type]) - 1))
                    }
                    style={styles.counterButton}>
                    <Text style={styles.counterText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.count}>{travellers[type]}</Text>
                  <TouchableOpacity
                    onPress={() =>
                      handleTravellerChange(type, travellers[type] + 1)
                    }
                    style={styles.counterButton}>
                    <Text style={styles.counterText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setShowTravellerModal(false)}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Search Button */}
      <TouchableOpacity style={styles.button} onPress={handleSearch}>
        <Text style={styles.buttonText}>Search Flights</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
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
});
