// screens/HomeScreen.js
import React, { useContext } from 'react';
import { View, Text, Button } from 'react-native';
import { AuthContext } from '../authContext';

export default function ProfileScreen() {
  const { logout } = useContext(AuthContext);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button title="Logout" onPress={logout} />

    </View>
  );
}


