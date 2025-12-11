import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import DateTimePicker from '@react-native-community/datetimepicker';
import { yupResolver } from '@hookform/resolvers/yup';
import dayjs from 'dayjs';
import { DepositeSchema, depositeType } from './types';
import { endpoints } from '../../utils/endpoints';
import { postData } from '../../utils/axios';
import Header from '../../Components/Header/Header';
import { Dropdown } from 'react-native-element-dropdown';

interface DepositRecord {
  id?: number;
  type: string;
  bank_name: string;
  branch_name: string;
  account_name: string;
  account_no: string;
  ifsc_code: string;
  date: string;
  deposit_status: 'pending' | 'accepted' | 'cancelled';
}

export default function Deposit() {
  const [list, setList] = useState<DepositRecord[]>([]);
  const [showDate1, setShowDate1] = useState(false);
  const [showDate2, setShowDate2] = useState(false);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<depositeType>({
    defaultValues: {
      deposite_type: '',
      deposite_status: '',
      date1: '',
      date2: '',
    },
    resolver: yupResolver(DepositeSchema),
  });

  const fetchDeposits = async (page = 1, isSearchReq = false, filters = {}) => {
    const url = isSearchReq
      ? endpoints.AGENT_GET_DEPOSITE_SEARCH
      : endpoints.AGENT_GET_DEPOSITE;

    const body = {
      page,
      limit: 1000, // reasonable limit
      ...(isSearchReq ? filters : {}),
    };

    try {
      const response = await postData({ url, body });
      if (response.status === 200 && response.data.status) {
        const dataWithId = response.data.result.map(
          (item: DepositRecord, index: number) => ({
            ...item,
            id: item.id ?? Math.random() * 1000000 + index, // unique fallback
          })
        );
        setList(dataWithId);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const onSubmit = (data: depositeType) => {
    const filters = {
      deposit_status: data.deposite_status,
      type: data.deposite_type,
      from_date: data.date1,
      to_date: data.date2,
    };
    fetchDeposits(1, true, filters);
  };

  const handleReset = () => {
    reset();
    fetchDeposits(1, false);
  };

  useEffect(() => {
    fetchDeposits(1);
  }, []);

  const renderCard = ({ item }: { item: DepositRecord }) => {
    let statusStyle = styles.pending;
    if (item.deposit_status === 'accepted') statusStyle = styles.accepted;
    else if (item.deposit_status === 'cancelled') statusStyle = styles.cancelled;

    return (
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <Text style={styles.cardTitle}>Bank:</Text>
          <Text style={styles.cardValue}>{item.bank_name}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cardTitle}>Type:</Text>
          <Text style={styles.cardValue}>{item.type}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cardTitle}>Branch:</Text>
          <Text style={styles.cardValue}>{item.branch_name}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cardTitle}>Account Name:</Text>
          <Text style={styles.cardValue}>{item.account_name}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cardTitle}>Account No:</Text>
          <Text style={styles.cardValue}>{item.account_no}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cardTitle}>IFSC:</Text>
          <Text style={styles.cardValue}>{item.ifsc_code}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cardTitle}>Date:</Text>
          <Text style={styles.cardValue}>
            {dayjs(item.date).format('DD MMM YYYY')}
          </Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cardTitle}>Status:</Text>
          <Text style={[styles.status, statusStyle]}>{item.deposit_status}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f0f0' }}>
      <Header title="Search Deposit Request" />
      <View style={styles.container}>
        <View style={styles.row}>
          <Controller
            control={control}
            name="deposite_type"
            render={({ field }) => (
              <View style={styles.column}>
                <Dropdown
                  style={styles.dropdown}
                  data={[
                    { label: 'Cash Deposit', value: 'cash' },
                    { label: 'Cheque Deposit', value: 'cheque' },
                    { label: 'Online Transfer', value: 'online' },
                  ]}
                  labelField="label"
                  valueField="value"
                  placeholder="Deposit Type"
                  value={field.value}
                  onChange={item => field.onChange(item.value)}
                />
                <Text style={styles.error}>{errors?.deposite_type?.message}</Text>
              </View>
            )}
          />
          <Controller
            control={control}
            name="deposite_status"
            render={({ field }) => (
              <View style={styles.column}>
                <Dropdown
                  style={styles.dropdown}
                  data={[
                    { label: 'Cancelled', value: 'cancelled' },
                    { label: 'Pending', value: 'pending' },
                    { label: 'Accepted', value: 'accepted' },
                  ]}
                  labelField="label"
                  valueField="value"
                  placeholder="Status"
                  value={field.value}
                  onChange={item => field.onChange(item.value)}
                />
                <Text style={styles.error}>{errors?.deposite_status?.message}</Text>
              </View>
            )}
          />
        </View>

        <View style={styles.row}>
          <Controller
            control={control}
            name="date1"
            render={({ field }) => (
              <View style={styles.column}>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setShowDate1(true)}
                >
                  <Text>
                    {field.value ? dayjs(field.value).format('DD-MM-YYYY') : 'From Date'}
                  </Text>
                </TouchableOpacity>
                {showDate1 && (
                  <DateTimePicker
                    value={field.value ? new Date(field.value) : new Date()}
                    mode="date"
                    display="default"
                    onChange={(e, date) => {
                      setShowDate1(false);
                      if (date) field.onChange(dayjs(date).format('YYYY-MM-DD'));
                    }}
                  />
                )}
                <Text style={styles.error}>{errors?.date1?.message}</Text>
              </View>
            )}
          />
          <Controller
            control={control}
            name="date2"
            render={({ field }) => (
              <View style={styles.column}>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setShowDate2(true)}
                >
                  <Text>
                    {field.value ? dayjs(field.value).format('DD-MM-YYYY') : 'To Date'}
                  </Text>
                </TouchableOpacity>
                {showDate2 && (
                  <DateTimePicker
                    value={field.value ? new Date(field.value) : new Date()}
                    mode="date"
                    display="default"
                    onChange={(e, date) => {
                      setShowDate2(false);
                      if (date) field.onChange(dayjs(date).format('YYYY-MM-DD'));
                    }}
                  />
                )}
                <Text style={styles.error}>{errors?.date2?.message}</Text>
              </View>
            )}
          />
        </View>
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.searchBtn} onPress={handleSubmit(onSubmit)}>
            <Text style={styles.btnText}>Search</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
            <Text style={styles.btnText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={list}
          renderItem={renderCard}
          keyExtractor={(item, index) =>
            item.id ? `${item.id}-${index}` : index.toString()
          }
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  column: { width: '48%' },
  dropdown: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  btnRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  searchBtn: { flex: 1, backgroundColor: '#007bff', marginRight: 10, padding: 12, borderRadius: 8 },
  resetBtn: { flex: 1, backgroundColor: '#dc3545', padding: 12, borderRadius: 8 },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  error: { color: 'red', fontSize: 12, marginTop: 4 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  cardTitle: { fontWeight: '700', color: '#555' },
  cardValue: { color: '#333', maxWidth: '60%', textAlign: 'right' },
  status: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, fontWeight: '600', textTransform: 'capitalize' },
  pending: { backgroundColor: '#FFE9B3', color: '#856404' },
  accepted: { backgroundColor: '#D4EDDA', color: '#155724' },
  cancelled: { backgroundColor: '#F8D7DA', color: '#721c24' },
});
