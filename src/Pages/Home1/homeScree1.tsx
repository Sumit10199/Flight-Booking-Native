// screens/HomeScreen.js
import React from 'react';
import { View, Text } from 'react-native';
import FlightSearchForm from './flightSearch';
import Flight_List from './Flight_List';

export default function HomeScreen() {
  return (
    <View 
    // style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
    >
      {/* <FlightSearchForm/> */}
      <Flight_List/>
    </View>
  );
}
