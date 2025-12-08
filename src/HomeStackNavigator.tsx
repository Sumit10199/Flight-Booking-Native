import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './Pages/Home1/homeScree1';
import Flight_List from './Pages/Home1/Flight_List';

const HomeStack = createNativeStackNavigator();

export default function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="Flight_List" component={Flight_List} />
    </HomeStack.Navigator>
  );
}
