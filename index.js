/**
 * @format
 */
import React from 'react';
import { AppRegistry } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { name as appName } from './app.json';
import RootNavigator from './src/rootNavigator'; // your main navigator
import { Store, persistor } from './src/Store/Store'; // adjust path if needed
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/authContext';

const Root = () => (
  <Provider store={Store}>
    <PersistGate loading={null} persistor={persistor}>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      {/* </NavigationContainer> */}
    </PersistGate>
  </Provider>
);

AppRegistry.registerComponent(appName, () => Root);
