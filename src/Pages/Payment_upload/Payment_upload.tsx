import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { postData } from '../../utils/axios';
import { endpoints } from '../../utils/endpoints';
import DepositModal from './DepositModal';
import Header from '../../Components/Header/Header';

export interface BankAccountRaw {
  id: number;
  account_no: string;
  account_name: string;
  bank_name: string;
  branch_name: string;
  ifsc_code: string;
  created_at: string;
}

const Payment_upload = () => {
  const [bankList, setBankList] = useState<BankAccountRaw[]>([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const getBankList = async () => {
    setLoading(true);
    try {
      const res = await postData({
        url: endpoints.GET_BANKINFO_LIST,
        body: {},
      });

      if (res.status === 200 && res.data.status) {
        setBankList(res.data.result);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getBankList();
  }, []);

  const renderItem = ({ item }: { item: BankAccountRaw }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <Text style={styles.label}>Bank Name</Text>
          <Text style={styles.value}>{item.bank_name}</Text>
        </View>

        <View style={styles.cardRow}>
          <Text style={styles.label}>Branch Name</Text>
          <Text style={styles.value}>{item.branch_name}</Text>
        </View>

        <View style={styles.cardRow}>
          <Text style={styles.label}>Account Name</Text>
          <Text style={styles.value}>{item.account_name}</Text>
        </View>

        <View style={styles.cardRow}>
          <Text style={styles.label}>Account Number</Text>
          <Text style={styles.value}>{item.account_no}</Text>
        </View>

        <View style={styles.cardRow}>
          <Text style={styles.label}>IFSC Code</Text>
          <Text style={styles.value}>{item.ifsc_code}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Header title="Deposit Request Form" />

      <TouchableOpacity
        style={styles.newBtn}
        onPress={() => setOpenModal(true)}
      >
        <Text style={{ color: '#fff', fontSize: 16 }}>New Deposit Request</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : (
        <FlatList
          data={bankList}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}

      <DepositModal
        visible={openModal}
        bankList={bankList}
        onClose={() => setOpenModal(false)}
      />
    </View>
  );
};

export default Payment_upload;

const styles = StyleSheet.create({
  newBtn: {
    backgroundColor: '#1e40af',
    padding: 12,
    borderRadius: 8,
    alignSelf: 'flex-end',
    margin: 10,
  },

  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    margin: 10,
  },

  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  label: {
    fontSize: 14,
    color: '#555',
    fontWeight: '600',
    flex: 1,
  },

  value: {
    fontSize: 14,
    color: '#000',
    flex: 1,
    textAlign: 'right',
    fontWeight: '500',
  },
});
