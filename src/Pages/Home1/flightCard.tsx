import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
} from 'react-native';
import dayjs from 'dayjs';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { flightDetails } from '../../Store/BookingDetails/bookingDetails';
import { FlightPNR } from './types';
import Icon from 'react-native-vector-icons/Ionicons';

interface FlightCardProps {
  flightListData: FlightPNR[];
  airlines: {
    airline_name: string;
    airline_code: string;
    airline_logo: string;
  }[];
}

const FlightCard: React.FC<FlightCardProps> = ({
  flightListData,
  airlines,
}) => {
  const [toggle, setToggle] = useState<Record<number, boolean>>({});
  const [currentFareIndex, setCurrentFareIndex] = useState<{
    [key: number]: number;
  }>({});
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

  const renderFlight = ({
    item,
    index,
  }: {
    item: FlightPNR;
    index: number;
  }) => {
    const logoData = airlines?.find(
      a => a.airline_code === item.segments[0]?.airline_code,
    );
    const airlineLogo =
      item?.segments[0]?.airline_logo ||
      logoData?.airline_logo ||
      'https://via.placeholder.com/50';

    const first = item.segments[0];
    const last = item.segments[item.segments.length - 1];

    return (
      <View style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.logoRow}>
            <Image source={{ uri: airlineLogo }} style={styles.logo} />
            <Text style={styles.flightText}>
              {first.airline_name} {first.flightNo}
            </Text>
          </View>

          <Text style={styles.dateText}>
            {first.depDate ? dayjs(first.depDate).format('DD-MMM-YYYY') : '--'}
          </Text>
        </View>
        <View style={styles.middleRow}>
          <View>
            <Text style={styles.time}>{first.depTime?.replace('HRS', '')}</Text>
            <Text style={styles.airport}>{first.origin}</Text>
          </View>

          <View style={styles.centerSection}>
            <View style={styles.dot} />
            <Icon name="airplane" size={28} color="#D35400" />
            <View style={styles.dot} />
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.time}>{last.arrTime?.replace('HRS', '')}</Text>
            <Text style={styles.airport}>{last.destination}</Text>
          </View>
        </View>
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Seats</Text>
            {item.fares && item.fares.length > 0 ? (
              <>
                <Text style={styles.value}>
                  {item.fares[currentFareIndex[index] ?? 0].Seats_Available}{' '}
                  Seats Left
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.value}>
                  {item.available_seats} Seats Left
                </Text>
              </>
            )}
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.label}>Fare</Text>
            <Text style={styles.price}>
              ₹{' '}
              {item.fares?.[0]?.FareDetails?.[0]?.Total_Amount ||
                item.adult_price}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => {
            dispatch(
              flightDetails({
                ...item,
                selected_fare: currentFareIndex[index],
              }),
            );
            navigation.navigate('booking_flight');
          }}
        >
          <Text style={styles.bookText}>Book Now</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity
          onPress={() => setToggle(prev => ({ ...prev, [index]: !prev[index] }))}
        >
          <Text style={styles.detailsToggle}>
            {toggle[index] ? 'Hide Details ▲' : 'View Details ▼'}
          </Text>
        </TouchableOpacity> */}
        {toggle[index] && (
          <View style={styles.detailsBox}>
            <Text style={styles.detailsHeader}>Flight Details</Text>

            {item.segments.map((s, sIdx) => (
              <View key={sIdx} style={styles.detailRow}>
                <Text style={styles.detailText}>
                  {s.origin_airport_name || s.origin} →{' '}
                  {s.destination_airport_name || s.destination}
                </Text>
                <Text style={styles.detailDate}>
                  {dayjs(s.depDate).format('DD MMM YYYY')}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <FlatList
      data={flightListData}
      keyExtractor={(_, idx) => idx.toString()}
      renderItem={renderFlight}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
};

export default FlightCard;

const styles = StyleSheet.create({
  card: {
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    elevation: 5,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  logoRow: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 45, height: 45, resizeMode: 'contain' },
  flightText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50',
  },
  dateText: { fontSize: 13, color: '#444', fontWeight: '500' },

  middleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },

  time: { fontSize: 22, fontWeight: '700', color: '#2C3E50' },
  airport: { fontSize: 14, fontWeight: '600', color: '#2C3E50' },
  city: { fontSize: 12, color: '#7F8C8D' },

  centerSection: { alignItems: 'center', justifyContent: 'center' },
  dot: {
    width: 4,
    height: 4,
    backgroundColor: '#aaa',
    borderRadius: 50,
    marginVertical: 4,
  },

  infoSection: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#F7F7F7',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  infoItem: { alignItems: 'center' },
  label: { fontSize: 13, color: '#666' },
  value: { fontSize: 14, fontWeight: '600' },
  price: { fontSize: 18, fontWeight: '700', color: '#D35400' },

  bookBtn: {
    marginTop: 14,
    backgroundColor: '#F39C12',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  bookText: { color: 'white', fontSize: 16, fontWeight: '700' },

  detailsToggle: {
    textAlign: 'right',
    marginTop: 10,
    color: '#2b51d5',
    fontWeight: '600',
  },

  detailsBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#EEF3FF',
  },

  detailsHeader: { fontWeight: '700', marginBottom: 6, fontSize: 14 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailText: { fontSize: 13, color: '#333' },
  detailDate: { fontSize: 12, color: '#555' },
});
