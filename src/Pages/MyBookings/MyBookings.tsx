import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Header from '../../Components/Header/Header';
import { useNavigation } from '@react-navigation/native';
import { GlobalResponseType, postData } from '../../utils/axios';
import { endpoints } from '../../utils/endpoints';
// import { generateInvoice } from '../generateInvoice/generateInvoice';
// import { printTicket } from '../printTicket/printTicket';

export default function MyBookings() {
  const navigation = useNavigation();
  const [bookingList, setBookingList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const getFlightBookingList = async () => {
    setIsLoading(true);
    try {
      const response: GlobalResponseType<any> = await postData({
        url: endpoints.GET_AGENT_BOOKING_FLIGHT_LIST,
        body: { page, limit },
      });

      if (response.status === 200 && response.data.status) {
        setBookingList(response.data.result);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getFlightBookingList();
  }, [page]);

  const filteredBookings = useMemo(() => {
    if (!searchTerm) return bookingList;

    return bookingList.filter((booking: any) => {
      const passengerNames = booking.passengers
        ?.map((pax: any) =>
          `${pax.pax_first_name} ${pax.pax_last_name}`.toLowerCase(),
        )
        .join(' ');
      const formattedId = `T24H-${String(booking?.id).padStart(7, '0')}`;

      return (
        booking.pnr_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formattedId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        passengerNames?.includes(searchTerm.toLowerCase())
      );
    });
  }, [searchTerm, bookingList]);

  // ---------- Actions ----------
  const handlePrintTicket = (booking: any) => {
    Alert.alert(
      'Choose Ticket Option',
      '',
      [
        // { text: 'With Display Price', onPress: () => printTicket(booking, true) },
        // { text: 'Without Display Price', onPress: () => printTicket(booking, false) },
        // { text: 'Without Price Section', onPress: () => printTicket(booking, true, false) },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true },
    );
  };

  const handlePrintInvoice = (booking: any) => {
    Alert.alert(
      'Choose Invoice Option',
      '',
      [
        // { text: 'With Display Price', onPress: () => generateInvoice(booking, true) },
        // { text: 'Without Display Price', onPress: () => generateInvoice(booking, false) },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true },
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Header title="My Bookings" />
      <ScrollView style={styles.container}>
        <View style={styles.searchBox}>
          <Icon name="search" size={18} color="#999" />
          <TextInput
            placeholder="Search by PNR, Ref No, Passenger"
            style={styles.searchInput}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color="#065F46"
            style={{ marginTop: 20 }}
          />
        ) : (
          filteredBookings.map((booking: any) => (
            <View style={styles.card} key={booking.id}>
              <View style={styles.rowBetween}>
                <Text style={styles.airline}>
                  {booking.flight_details[0]?.airline_name}
                </Text>
                <Text style={styles.bookingId}>{`T24H-${String(
                  booking?.id,
                ).padStart(7, '0')}`}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.routeRow}>
                <Text style={styles.city}>
                  {booking.flight_details[0]?.origin_code}
                </Text>
                <View style={styles.lineWithIcon}>
                  <View style={styles.dot} />
                  <View style={styles.flightIconCircle}>
                    <Image source={require('../../../assets/flight.png')} />
                  </View>
                  <View style={styles.dot} />
                </View>
                <Text style={styles.city}>
                  {booking.flight_details[0]?.destination_code}
                </Text>
              </View>

              <View style={styles.passengerBox}>
                {booking.passengers.map((pax: any) => (
                  <Text key={pax.booking_detail_id}>
                    {pax.pax_title} {pax.pax_first_name} {pax.pax_last_name}{' '}
                    {pax.needWheelchair === 'YES' ? '(W)' : ''}
                    {pax.is_cancelation === 'Yes' ? '- Cancelled' : ''}
                  </Text>
                ))}
              </View>

              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.label}>Departure Date</Text>
                  <Text style={styles.value}>
                    {new Date(booking.pnr_date).toLocaleDateString()}
                  </Text>
                </View>
                <View>
                  <Text style={styles.label}>Booking Date</Text>
                  <Text style={styles.value}>
                    {new Date(booking.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.label}>PNR</Text>
                  <Text style={styles.value}>{booking.pnr_no}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.label}>Total Fare</Text>
                  <Text style={styles.value}>{booking.booking_price}</Text>
                </View>
              </View>

              <View style={styles.buttonWrapper}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handlePrintInvoice(booking)}
                >
                  <Text style={styles.actionText}>Print Invoice</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handlePrintTicket(booking)}
                >
                  <Text style={styles.actionText}>Print Ticket</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn}>
                  <Text style={styles.actionText}>Name Change</Text>
                </TouchableOpacity>

                {booking.passengers?.length !==
                  booking?.cancel_requests?.length && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.cancelBtn]}
                  >
                    <Text style={styles.actionText}>Cancel Booking</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}

        <View style={styles.pagination}>
          <TouchableOpacity
            disabled={page === 1}
            onPress={() => setPage(page - 1)}
            style={[styles.pageBtn, page === 1 && { opacity: 0.5 }]}
          >
            <Text>Prev</Text>
          </TouchableOpacity>
          <Text
            style={{ marginHorizontal: 10 }}
          >{`${page} / ${totalPages}`}</Text>
          <TouchableOpacity
            disabled={page === totalPages}
            onPress={() => setPage(page + 1)}
            style={[styles.pageBtn, page === totalPages && { opacity: 0.5 }]}
          >
            <Text>Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    padding: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    height: 45,
    borderRadius: 10,
    elevation: 1,
    marginBottom: 20,
  },
  searchInput: {
    marginLeft: 10,
    flex: 1,
  },
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    elevation: 3,
    marginBottom: 20,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  airline: {
    fontSize: 16,
    fontWeight: '600',
  },
  bookingId: {
    fontSize: 14,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 16,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  city: {
    fontSize: 16,
    fontWeight: '600',
  },
  lineWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
    justifyContent: 'space-between',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#888',
  },
  flightIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E85C37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passengerBox: {
    marginVertical: 16,
  },
  label: {
    color: '#777',
    fontSize: 12,
    marginBottom: 3,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
    alignItems: 'center',
    marginBottom:50
  },
  pageBtn: {
    backgroundColor: '#DDD',
    padding: 8,
    borderRadius: 6,
  },
  buttonWrapper: {
    marginTop: 15,
  },

  actionBtn: {
    backgroundColor: '#0A84FF',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },

  cancelBtn: {
    backgroundColor: '#FF3B30',
  },

  actionText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
