import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Ipayment, Payment_schema } from './types';
import { postData } from '../../utils/axios';
import { endpoints } from '../../utils/endpoints';
import Toast from 'react-native-toast-message';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
  visible: boolean;
  onClose: () => void;
  bankList: any[];
}

const DepositModal = ({ visible, onClose, bankList }: Props) => {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Ipayment>({
    resolver: yupResolver(Payment_schema),
    mode: 'onChange',
  });

  console.log(watch('account_no'));

  const [showDate, setShowDate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agentData, setAgentData] = useState<any>(null);
  
  const depositTypes = [
    { label: 'Cash Deposit', value: 'cash' },
    { label: 'Cheque Deposit', value: 'cheque' },
    { label: 'Online Transfer', value: 'online' },
  ];

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const res = await postData({
        url: endpoints.AGET_CREATE_DEPOSITE,
        body: {
          type: data.deposite_type,
          amount:Number(data.deposite_amount),
          bank_id: data.amount_trans_info,
          date: data.date,
          agent_id:agentData?.id
        },
      });

      if (res.data.status) {        
        reset();
        onClose();
        Toast.show({ type: 'success', text2: res.data.message });
      } else {
        Toast.show({ type: 'error', text2: res.data.message });
      }
    } finally {
      setLoading(false);
    }
  };
  const handleBankSelect = (bankId: string | number) => {
    const bank = bankList.find(item => Number(item.id) === Number(bankId));

    if (bank) {
      setValue('account_holder_name', bank.account_name || '', {
        shouldValidate: true,
      });
      setValue('account_no', String(bank.account_no) || '', {
        shouldValidate: true,
      });
    }
  };
  const handleCancel = () => {
    reset({}, { keepErrors: false });
    onClose();
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
  }, []);
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.title}>New Deposit Request</Text>
          <Text style={styles.label}>Deposit Type</Text>
          <Controller
            control={control}
            name="deposite_type"
            render={({ field: { onChange, value } }) => (
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholder}
                selectedTextStyle={styles.valueText}
                data={depositTypes}
                labelField="label"
                valueField="value"
                placeholder="Select Type"
                value={value}
                onChange={item => onChange(item.value)}
              />
            )}
          />
          {errors?.deposite_type && (
            <Text style={styles.errorText}>{errors.deposite_type.message}</Text>
          )}
          <Text style={styles.label}>Deposit Amount</Text>
          <Controller
            control={control}
            name="deposite_amount"
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={text => {
                    if (/^[0-9]*$/.test(text)) {
                      onChange(text);
                    }
                  }}
                  placeholder="Enter amount"
                />

                {errors?.deposite_amount && (
                  <Text style={styles.errorText}>
                    {errors.deposite_amount.message}
                  </Text>
                )}
              </>
            )}
          />

          <Text style={styles.label}>Amount Transferred Info</Text>
          <Controller
            control={control}
            name="amount_trans_info"
            render={({ field: { onChange, value } }) => (
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholder}
                selectedTextStyle={styles.valueText}
                data={bankList.map(item => ({
                  label: `${item.account_name} - ${item.bank_name}`,
                  value: item.id,
                }))}
                labelField="label"
                valueField="value"
                placeholder="Select Account"
                value={value}
                onChange={item => {
                  onChange(item.value);
                  handleBankSelect(item.value);
                }}
              />
            )}
          />
          {errors?.amount_trans_info && (
            <Text style={styles.errorText}>
              {errors.amount_trans_info.message}
            </Text>
          )}
          <Text style={styles.label}>Deposit Date</Text>
          <Controller
            control={control}
            name="date"
            render={({ field: { onChange, value } }) => (
              <>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setShowDate(true)}
                >
                  <Text style={styles.valueText}>
                    {value ? dayjs(value).format('YYYY-MM-DD') : 'Select Date'}
                  </Text>
                </TouchableOpacity>

                {showDate && (
                  <DateTimePicker
                    value={value ? new Date(value) : new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                      setShowDate(false);
                      if (date) onChange(date.toISOString());
                    }}
                  />
                )}
              </>
            )}
          />
          {errors?.date && (
            <Text style={styles.errorText}>{errors.date.message}</Text>
          )}

          <Text style={styles.label}>Account Holder Name</Text>
          <Controller
            control={control}
            name="account_holder_name"
            render={({ field }) => (
              <TextInput
                style={styles.disabledInput}
                editable={false}
                {...field}
              />
            )}
          />

          <Text style={styles.label}>Account No</Text>
          <Controller
            control={control}
            name="account_no"
            render={({ field }) => (
              <TextInput
                style={styles.disabledInput}
                editable={false}
                {...field}
              />
            )}
          />

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DepositModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 14,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginTop: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    color: 'black',
  },
  disabledInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 10,
    color: '#777',
  },
  dropdown: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  placeholder: { color: '#aaa' },
  valueText: { color: '#333', fontSize: 14 },
  errorText: { color: 'red', fontSize: 12, marginTop: 2 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  cancelBtn: {
    backgroundColor: '#d94647',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginRight: 10,
  },
  submitBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  cancelText: { color: '#fff', fontWeight: '500' },
  submitText: { color: '#fff', fontWeight: '600' },
});
