import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './Pages/Login/login';
// import SignupScreen from './Pages/Signup/signup';
import Registration from "./Pages/Registration/registration"
const Stack = createNativeStackNavigator();

export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      {/* <Stack.Screen name="Signup" component={SignupScreen} /> */}
      <Stack.Screen name="Signup" component={Registration} />
    </Stack.Navigator>
  );
}
