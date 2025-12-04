// import { NavigationContainer } from '@react-navigation/native';
import { useContext } from 'react';
import { AuthContext } from './authContext';
import App from './navigator';
import { AuthStack } from './authNavigator';
import { Text, View } from 'react-native';
import LoginScreen from './Pages/Login/login';

export default function RootNavigator() {
    const { isAuthenticated, isLoading } = useContext(AuthContext);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
                <Text style={{ color: '#fff', fontSize: 16 }}>Loading...</Text>
            </View>
        );
    }

    if (!isAuthenticated) {
        return <AuthStack />;
    }

    return <App />;
}
