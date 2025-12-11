import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { postData } from '../../utils/axios';
import { endpoints } from '../../utils/endpoints';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

export const StatementSchema = Yup.object().shape({
  date1: Yup.string().required('From date is required'),
  date2: Yup.string().required('To date is required'),
});

export type statementType = {
  date1: string;
  date2: string;
};

interface StatementItem {
  id: number;
  created_at: string;
  book_id?: string | null;
  remarks: string;
  bal_type: string;
  txn_type: 'credit' | 'debit';
  amount: number;
  prev_bal: number;
  avail_bal: number;
}

export default function AccountStatementScreen() {
  const [showDate1, setShowDate1] = useState(false);
  const [showDate2, setShowDate2] = useState(false);
  const [statement, setStatement] = useState<StatementItem[]>([]);
  const [loader, setLoader] = useState(false);
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<statementType>({
    resolver: yupResolver(StatementSchema),
    defaultValues: {
      date1: '',
      date2: '',
    },
    mode: 'onChange',
  });

  const fetchStatement = async (fromDate?: string, toDate?: string) => {
    setLoader(true);

    try {
      const body: any = { page: 1, limit: 1000000000 };

      if (fromDate && toDate) {
        body.from_date = fromDate;
        body.to_date = toDate;
      }

      const res = await postData({
        url:
          fromDate && toDate
            ? endpoints.GET_AGENT_ACCOUNT_STATEMENT_BY_DATE
            : endpoints.GET_AGENT_ACCOUNT_STATEMENT,
        body,
      });

      if (res.status === 200 && res.data.status) {
        setStatement(res.data.result);
      } else {
        setStatement([]);
      }
    } catch (e) {
      console.log('Error:', e);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    fetchStatement();
  }, []);

  const onSubmit: SubmitHandler<statementType> = data => {
    fetchStatement(data.date1, data.date2);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account Statement</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 15 }}>
        <View style={styles.filterCard}>
          <Text style={styles.filterTitle}>Select Date</Text>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <View style={{ flex: 1, marginRight: 8 }}>
              <Controller
                control={control}
                name="date1"
                render={({ field }) => (
                  <>
                    <TouchableOpacity
                      style={styles.inputBox}
                      onPress={() => setShowDate1(true)}
                    >
                      <Text style={styles.inputText}>
                        {field.value
                          ? dayjs(field.value).format('DD-MM-YYYY')
                          : 'From Date'}
                      </Text>
                    </TouchableOpacity>

                    {errors.date1 && (
                      <Text style={styles.errorText}>
                        {errors.date1.message}
                      </Text>
                    )}

                    {showDate1 && (
                      <DateTimePicker
                        value={field.value ? new Date(field.value) : new Date()}
                        mode="date"
                        display="calendar"
                        onChange={(event, selected) => {
                          setShowDate1(false);
                          if (selected) {
                            const formatted = selected
                              .toISOString()
                              .split('T')[0];
                            field.onChange(formatted);
                          }
                        }}
                      />
                    )}
                  </>
                )}
              />
            </View>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <Controller
                control={control}
                name="date2"
                render={({ field }) => (
                  <>
                    <TouchableOpacity
                      style={styles.inputBox}
                      onPress={() => setShowDate2(true)}
                    >
                      <Text style={styles.inputText}>
                        {field.value
                          ? dayjs(field.value).format('DD-MM-YYYY')
                          : 'To Date'}
                      </Text>
                    </TouchableOpacity>

                    {errors.date2 && (
                      <Text style={styles.errorText}>
                        {errors.date2.message}
                      </Text>
                    )}

                    {showDate2 && (
                      <DateTimePicker
                        value={field.value ? new Date(field.value) : new Date()}
                        mode="date"
                        display="calendar"
                        onChange={(event, selected) => {
                          setShowDate2(false);
                          if (selected) {
                            const formatted = selected
                              .toISOString()
                              .split('T')[0];
                            field.onChange(formatted);
                          }
                        }}
                      />
                    )}
                  </>
                )}
              />
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.searchBtn}
              onPress={handleSubmit(onSubmit)}
            >
              <Text style={styles.btnText}>Search</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => {
                reset({ date1: '', date2: '' });
                fetchStatement();
              }}
            >
              <Text style={styles.btnText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loader ? (
          <ActivityIndicator size={40} style={{ marginTop: 50 }} />
        ) : statement.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 20, fontSize: 16 }}>
            No Records Found
          </Text>
        ) : (
          <FlatList
            data={statement}
            scrollEnabled={false}
            keyExtractor={item => String(item.id)}
            renderItem={({ item, index }) => (
              <View style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.label}>Date:</Text>
                  <Text style={styles.value}>
                    {dayjs(item.created_at).format('DD MMM YYYY')}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Book ID:</Text>
                  <Text style={styles.value}>{item.book_id || '-'}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Remark:</Text>
                  <Text
                    style={[
                      styles.value,
                      { flex: 1, flexWrap: 'wrap', textAlign: 'right' },
                    ]}
                  >
                    {item.remarks}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Balance Type:</Text>
                  <Text style={styles.value}>
                    {item.bal_type.charAt(0).toUpperCase() +
                      item.bal_type.slice(1).toLowerCase()}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Credit:</Text>
                  <Text style={styles.credit}>
                    {item.txn_type === 'credit' ? item.amount : '-'}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Debit:</Text>
                  <Text style={styles.debit}>
                    {item.txn_type === 'debit' ? item.amount : '-'}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Prev Balance:</Text>
                  <Text style={styles.value}>{item.prev_bal}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Available:</Text>
                  <Text style={styles.value}>{item.avail_bal}</Text>
                </View>
              </View>
            )}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#e68725',
    paddingVertical: 18,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },

  filterCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 15,
  },

  inputBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
  },
  inputText: {
    fontSize: 15,
  },
  errorText: {
    color: 'red',
    marginBottom: 4,
    marginLeft: 4,
  },

  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  searchBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    width: '48%',
    borderRadius: 8,
  },
  resetBtn: {
    backgroundColor: '#b91c1c',
    paddingVertical: 10,
    width: '48%',
    borderRadius: 8,
  },
  btnText: {
    color: 'white',
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '600',
  },

  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: '#305E92',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  label: { fontSize: 15, fontWeight: '600' },
  value: { fontSize: 15 },

  credit: { color: 'green', fontSize: 15, fontWeight: '600' },
  debit: { color: 'red', fontSize: 15, fontWeight: '600' },
});
