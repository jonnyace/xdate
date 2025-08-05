import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import Toast from 'react-native-toast-message';

import Navigation from './src/navigation/Navigation';
import { AuthProvider } from './src/context/AuthContext';

const theme = {
  colors: {
    primary: '#1d9bf0',
    secondary: '#f91880',
    background: '#ffffff',
    surface: '#f8f9fa',
    text: '#0f1419',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <NavigationContainer>
            <Navigation />
            <StatusBar style="auto" />
            <Toast />
          </NavigationContainer>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}