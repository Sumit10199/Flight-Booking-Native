import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './Pages/Home1/homeScree1';
import Flight_List from './Pages/Home1/Flight_List';
import booking_flight from "./Pages/Home1/Booking_ticket/Booking_ticket"

const HomeStack = createNativeStackNavigator();

export default function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="Flight_List" component={Flight_List} />
      <HomeStack.Screen name="booking_flight" component={booking_flight} />
    </HomeStack.Navigator>
  );
}
