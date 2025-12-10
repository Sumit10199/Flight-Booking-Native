import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import ProfileScreen from "./Pages/Profile/profileScreen";
import HomeScreen from './Pages/Home1/homeScree1';
import HomeStackNavigator from './HomeStackNavigator';
import BookingScreen from "./Pages/MyBookings/MyBookings"
import AccountStatementScreen from "./Pages/Statement/Statement"
import PaymentScreen from "./Pages/PaymentModules/PaymentModules"
import CancellationRequest from "./Pages/CancellationBooking/CancellationBooking"

// import SettingsScreen from './screens/SettingsScreen';
// import ProfileScreen from './screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarHideOnKeyboard:true,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName:string="";

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } 
            else if (route.name === 'Booking') {
        iconName = focused ? 'document-text-outline' : 'document-text-outline';

      }
            else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: { paddingBottom: 5, height: 60 },
        })}
      >
        <Tab.Screen name="Home" component={HomeStackNavigator} />
          <Tab.Screen name="Booking" component={BookingScreen} />

        <Tab.Screen name="Profile" component={ProfileScreen} />
        {/* <Tab.Screen name="Settings" component={SettingsScreen} /> */}
      </Tab.Navigator>
    </NavigationContainer>
  );
}
