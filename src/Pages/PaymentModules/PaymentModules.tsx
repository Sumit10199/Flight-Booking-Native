import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Dropdown } from 'react-native-element-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { postData, GlobalResponseType } from '../../utils/axios';
import { endpoints } from '../../utils/endpoints';
import { PaymentModule } from '../Home1/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../Components/Header/Header';

interface PaymentFormData {
  amount: number;
  gateway: number;
}

const schema = yup.object().shape({
  amount: yup
    .number()
    .typeError('Amount must be a number')
    .required('Amount is required')
    .positive('Amount must be greater than 0'),

  gateway: yup
    .number()
    .typeError('Gateway is required')
    .required('Gateway is required')
    .positive('Choose a valid gateway'),
});

const PaymentScreen = () => {
  const [loading, setLoading] = useState(false);
  const [paymentModule, setPaymentModule] = useState<PaymentModule[]>([]);
  const [agentData, setAgentData] = useState<any>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: yupResolver(schema),
    defaultValues: { amount: 0, gateway: 0 },
    mode: 'onChange',
  });

  const cashFreePayment_createGateway = async (
    amount: number,
    booking_id: string,
  ) => {
    try {
      const response: GlobalResponseType<{ status: boolean; url: string }> =
        await postData({
          url: endpoints?.AGENT_CREATE_CASHDREE_PAYMENT_GATEWAY,
          body: {
            amount,
            book_id: booking_id,
            purpose: 'recharge',
            customer: {
              phone: agentData.mobile_no,
              email: agentData.email_id,
              name: `${agentData.first_name} ${agentData.last_name}`,
            },
          },
        });

      if (response.status === 200 && response.data.status) {
        Linking.openURL(response.data.url);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const generatePhonePeURL = async (
    data: PaymentFormData,
    booking_id: string,
  ) => {
    try {
      setLoading(true);

      const response: GlobalResponseType<{
        status: boolean;
        url: { redirectUrl: string };
      }> = await postData({
        url: endpoints.GENERATE_PHONEPE_URL,
        body: { amount: Number(data.amount) * 100, book_id: booking_id },
      });

      if (response.status === 200 && response.data.status) {
        Linking.openURL(response.data.url.redirectUrl);
      }
    } finally {
      setLoading(false);
    }
  };

  const atomPayment_createGateway = async (
    amount: number,
    booking_id: string,
  ) => {
    try {
      const response: GlobalResponseType<{ status: boolean; result: string }> =
        await postData({
          url: endpoints?.AGENT_CREATE_ATOM_PAYMENT_GATEWAY,
          body: {
            amount,
            booking_id,
            agent_id: agentData.id,
          },
        });

      if (response.status === 200 && response.data.status) {
        Linking.openURL(
          'data:text/html,' + encodeURIComponent(response.data.result),
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onSubmit = (data: PaymentFormData) => {
    const amount = Number(data.amount);
    const bookingId = `OR${Math.floor(1000 + Math.random() * 9000)}`;

    if (data.gateway === 1) generatePhonePeURL(data, bookingId);
    else if (data.gateway === 2)
      cashFreePayment_createGateway(amount, bookingId);
    else if (data.gateway === 3) atomPayment_createGateway(amount, bookingId);
  };

  const getPaymentModule = async () => {
    try {
      const response: GlobalResponseType<{ status: boolean; result: [] }> =
        await postData({
          url: endpoints.GET_AGENT_PAYMENT_MODULE,
          body: {},
        });

      if (response.status === 200 && response.data.status) {
        setPaymentModule(response.data.result);
      }
    } catch (error) {
      console.log(error);
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
    getPaymentModule();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Online Recharge" />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>💳 Secure Payment</Text>

          <Text style={styles.label}>Enter INR Amount</Text>
          <Controller
            name="amount"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInput
                value={String(value)}
                onChangeText={text => onChange(text)}
                keyboardType="numeric"
                placeholder="Enter amount"
                style={styles.input}
              />
            )}
          />
          {errors.amount && (
            <Text style={styles.error}>{errors.amount.message}</Text>
          )}

          <Text style={styles.label}>Choose Payment Gateway</Text>

          <Controller
            name="gateway"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Dropdown
                style={styles.dropdown}
                data={paymentModule.map(g => ({
                  label: g.payment_module,
                  value: g.id,
                }))}
                labelField="label"
                valueField="value"
                placeholder="-- Select Gateway --"
                value={value}
                onChange={item => onChange(item.value)}
              />
            )}
          />

          {errors.gateway && (
            <Text style={styles.error}>{errors.gateway.message}</Text>
          )}

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.6 }]}
            disabled={loading}
            onPress={handleSubmit(onSubmit)}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Proceed to Pay</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    backgroundColor: '#eef2f7',
  },

  // MODERN CARD UI
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 25,
    color: '#0a4fff',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#444',
  },

  input: {
    borderWidth: 1,
    borderColor: '#d0d7e2',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#f8faff',
    fontSize: 16,
    marginBottom: 4,
  },

  dropdown: {
    borderWidth: 1,
    borderColor: '#d0d7e2',
    borderRadius: 12,
    backgroundColor: '#f8faff',
    paddingHorizontal: 12,
    paddingVertical: 14,
  },

  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },

  button: {
    backgroundColor: '#0061fe',
    padding: 16,
    borderRadius: 14,
    marginTop: 25,
    alignItems: 'center',
    shadowColor: '#0061fe',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
