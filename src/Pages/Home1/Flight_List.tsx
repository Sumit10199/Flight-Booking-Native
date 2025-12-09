import React from 'react-native';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FlightCard from './flightCard';
import { useNavigation } from '@react-navigation/native';

const FlightListPage = ({ route }: { route: any }) => {
  const { flights, airlines } = route.params;
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>{'<'}</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Search Result</Text>

        <View style={{ width: 25 }} />
      </View>
      <View style={{ flex: 1 }}>
        <FlightCard flightListData={flights} airlines={airlines} />
      </View>
    </View>
  );
};

export default FlightListPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
    borderColor: '#E5E5E5',
    backgroundColor: '#fff',
  },

  backArrow: {
    fontSize: 22,
    color: '#000',
    paddingRight: 10,
  },

  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
});
