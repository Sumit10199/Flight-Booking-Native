import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './Pages/Login/login';
// import SignupScreen from './Pages/Signup/signup';
import Registration from "./Pages/Registration/registration"
import { NavigationContainer } from '@react-navigation/native';
const Stack = createNativeStackNavigator();

export function AuthStack() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={LoginScreen} />
                {/* <Stack.Screen name="Signup" component={SignupScreen} /> */}
                <Stack.Screen name="Signup" component={Registration} />
            </Stack.Navigator>
        </NavigationContainer>

    );
}
