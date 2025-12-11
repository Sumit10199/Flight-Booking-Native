import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './Pages/Login/login';
// import SignupScreen from './Pages/Signup/signup';
import Registration from "./Pages/Registration/registration"
import business_information from "./Pages/Registration/business_information"
import { NavigationContainer } from '@react-navigation/native';
import ForgetPasswordScreen from './Pages/ForgetPassword/forget_password';
import ChangePasswordScreen from './Pages/ForgetPassword/ChangePasswordScreen';
import ChangeNameScreen from './Pages/Name_change_request/NameChangeScreen';

const Stack = createNativeStackNavigator();

export function AuthStack() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={LoginScreen} />
                {/* <Stack.Screen name="Signup" component={SignupScreen} /> */}
                <Stack.Screen name="Signup" component={Registration} />
                <Stack.Screen name="business_information" component={business_information} />
                <Stack.Screen name="ForgotPassword" component={ForgetPasswordScreen} />
                <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
                <Stack.Screen name="ChangeName" component={ChangeNameScreen} />
            </Stack.Navigator>
        </NavigationContainer>

    );
}
