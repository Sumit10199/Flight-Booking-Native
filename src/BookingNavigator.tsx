import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './Pages/Home1/homeScree1';
import NameChangeRequestScreen from './Pages/Name_change_request/NameChangeScreen';
import BookingScreen from "./Pages/MyBookings/MyBookings"

const HomeStack = createNativeStackNavigator();

export default function BookingNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Booking" component={BookingScreen} />
      <HomeStack.Screen name="name_change" component={NameChangeRequestScreen} />

    </HomeStack.Navigator>
  );
}
