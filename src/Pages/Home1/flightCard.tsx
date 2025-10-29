import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet, ScrollView } from 'react-native';
import dayjs from 'dayjs';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { flightDetails } from '../../Store/BookingDetails/bookingDetails';
import { FlightPNR } from './types';

interface FlightCardProps {
  flightListData: FlightPNR[];
  airlines: {
    airline_name: string;
    airline_code: string;
    airline_logo: string;
  }[];
}

const FlightCard: React.FC<FlightCardProps> = ({ flightListData, airlines }) => {
  const [toggle, setToggle] = useState<Record<number, boolean>>({});
  const [currentFareIndex, setCurrentFareIndex] = useState<{ [key: number]: number }>({});
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (flightListData) {
      const initial = flightListData.reduce((acc, _, idx) => {
        acc[idx] = 0;
        return acc;
      }, {} as { [key: number]: number });
      setCurrentFareIndex(initial);
    }
  }, [flightListData]);

  const renderFlight = ({ item, index }: { item: FlightPNR; index: number }) => {
    const logo = airlines?.find(a => a.airline_code === item.segments[0].airline_code);
    const airlineLogo = item?.segments[0]?.airline_logo ?? logo?.airline_logo;

    return (
      <View style={styles.card}>
        <View style={styles.topSection}>
          <View style={styles.airlineBlock}>
            <Image source={{ uri: airlineLogo }} style={styles.airlineLogo} />
            <Text style={styles.airlineName}>
              {item.segments[0].airline_name} {item.segments[0].flightNo}
            </Text>
          </View>

          <View style={styles.timeSection}>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.timeText}>{item.segments[0].depTime.replace('HRS', '')}</Text>
              <Text style={styles.dateText}>
                {dayjs(item.segments[0].depDate).format('ddd, DD MMM, YYYY')}
              </Text>
              <Text style={styles.cityText}>{item.segments[0].origin}</Text>
            </View>

            <View style={styles.routeLine}>
              <Text style={styles.stopsText}>
                {item.segments.length - 1 === 0
                  ? 'Non-stop'
                  : `${item.segments.length - 1} stop(s)`}
              </Text>
            </View>

            <View>
              <Text style={styles.timeText}>
                {item.segments[item.segments.length - 1].arrTime.replace('HRS', '')}
              </Text>
              <Text style={styles.dateText}>
                {dayjs(item.segments[item.segments.length - 1].arrDate).format('ddd, DD MMM, YYYY')}
              </Text>
              <Text style={styles.cityText}>
                {item.segments[item.segments.length - 1].destination}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSection}>
          <Text style={styles.priceText}>₹ {item.fares?.[0]?.FareDetails?.[0]?.Total_Amount || item.adult_price}</Text>
          <TouchableOpacity
            style={styles.bookBtn}
            onPress={() => {
              dispatch(flightDetails({ ...item, selected_fare: currentFareIndex[index] }));
              navigation.navigate('BookingTicket');
            }}>
            <Text style={styles.bookText}>Book Now</Text>
          </TouchableOpacity>
        </View>

        {toggle[index] && (
          <View style={styles.detailsSection}>
            <Text style={styles.detailsHeader}>Flight Details</Text>
            {item.segments.map((s, sIdx) => (
              <View key={sIdx} style={styles.segmentRow}>
                <Text>{s.origin_airport_name} → {s.destination_airport_name}</Text>
                <Text>{dayjs(s.depDate).format('DD MMM YYYY')}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.detailsToggle}
          onPress={() => setToggle(prev => ({ ...prev, [index]: !prev[index] }))}>
          <Text style={{ color: '#2b51d5' }}>
            {toggle[index] ? 'Hide Details ▲' : 'View Details ▼'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView>
      <FlatList
        data={flightListData}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={renderFlight}
      />
    </ScrollView>
  );
};

export default FlightCard;

const styles = StyleSheet.create({
  card: {
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  topSection: { flexDirection: 'row', marginBottom: 10 },
  airlineBlock: { width: '25%', alignItems: 'center' },
  airlineLogo: { width: 50, height: 50, resizeMode: 'contain' },
  airlineName: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  timeSection: { flex: 1, flexDirection: 'row', justifyContent: 'space-between' },
  timeText: { fontSize: 18, fontWeight: '700', color: '#17517b' },
  dateText: { fontSize: 12, color: '#495057' },
  cityText: { fontSize: 13, fontWeight: '600', color: '#17517b' },
  routeLine: { justifyContent: 'center', alignItems: 'center' },
  stopsText: { color: '#2b51d5', fontWeight: '600' },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: { fontSize: 20, fontWeight: 'bold', color: '#17517b' },
  bookBtn: {
    backgroundColor: '#2b51d5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  bookText: { color: '#fff', fontWeight: '600' },
  detailsToggle: { alignSelf: 'flex-end', marginTop: 5 },
  detailsSection: { marginTop: 10, backgroundColor: '#f7f7f7', padding: 10, borderRadius: 8 },
  detailsHeader: { fontWeight: '700', marginBottom: 5 },
  segmentRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
});
