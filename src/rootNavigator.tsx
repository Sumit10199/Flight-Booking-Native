// import { NavigationContainer } from '@react-navigation/native';
import { useContext } from 'react';
import { AuthContext } from './authContext';
import App from './navigator';
import { AuthStack } from './authNavigator';
import { Image, Text, View } from 'react-native';
import { StyleSheet } from 'react-native';
import Icon from "react-native-vector-icons/Feather";
export default function RootNavigator() {
    const { isAuthenticated, isLoading } = useContext(AuthContext);

    if (isLoading) {
        return (
            // <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
            //     <Text style={{ color: '#fff', fontSize: 16 }}>Loading...</Text>
            // </View>
            <SplashScreen/>
        );
    }

    if (!isAuthenticated) {
        return <AuthStack />;
    }

    return <App />;
}


const SplashScreen = () => {
  return (
    <View style={styles.container}>
       <Image 
              source={require("../assets/Vector.png")} 
              resizeMode="contain"
          />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e68725",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
});

