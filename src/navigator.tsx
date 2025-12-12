// App.js
import 'react-native-gesture-handler'; // MUST be at the top
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/Ionicons';


// Import your screens
import ProfileScreen from './Pages/Profile/profileScreen';
import HomeStackNavigator from './HomeStackNavigator';
import BookingNavigator from './BookingNavigator';
import PaymentScreen from './Pages/PaymentModules/PaymentModules';
import CancellationRequest from './Pages/CancellationBooking/CancellationBooking';
import AccountStatementScreen from './Pages/Statement/Statement';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Deposit from "./Pages/Deposit/Deposit"
import Payment_upload from "./Pages/Payment_upload/Payment_upload"
import { AuthContext } from './authContext';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';



const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';

          if (route.name === 'Home')
            iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Booking')
            iconName = focused
              ? 'document-text-outline'
              : 'document-text-outline';
          else if (route.name === 'Profile')
            iconName = focused ? 'person' : 'person-outline';

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { paddingBottom: 5, height: 60 },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="Booking" component={BookingNavigator} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
     <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
      <Drawer.Navigator
        screenOptions={{
          headerShown: false,
        }}
        drawerContent={props => <CustomDrawerContent {...props} />}

      >
        <Drawer.Screen
          name="HomeTabs"
          component={BottomTabs}
          options={{ drawerLabel: 'Home' }}
        />

        <Drawer.Screen
          name="Payments"
          component={PaymentScreen}
          options={{ drawerLabel: 'Online Recharge' }}
        />
        <Drawer.Screen
          name="Cancellation"
          component={CancellationRequest}
          options={{ drawerLabel: 'Cancellation' }}
        />
        <Drawer.Screen
          name="AccountStatement"
          component={AccountStatementScreen}
          options={{ drawerLabel: 'Account Statement' }}
        />
        <Drawer.Screen
          name="Deposit"
          component={Deposit}
          options={{ drawerLabel: 'Deposite Request List' }}
        />
        <Drawer.Screen
          name="Payment_upload"
          component={Payment_upload}
          options={{ drawerLabel: 'Payment Upload' }}
        />

        
      </Drawer.Navigator>
    </NavigationContainer>
     </GestureHandlerRootView>
    
  );
}



function CustomDrawerContent(props: any) {
  const {logout} = useContext(AuthContext);

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />

      <View style={{marginTop: 16, paddingHorizontal: 16}}>
        <TouchableOpacity
          onPress={logout}
          style={profileStyles.logoutBtn}>
          <Text style={profileStyles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}


export const profileStyles = StyleSheet.create({
  logoutBtn: {
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#FF4B4B',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
