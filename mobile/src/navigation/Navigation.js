import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { useAuth } from '../context/AuthContext';

// Placeholder screens
const LandingScreen = () => <Text style={{textAlign: 'center', marginTop: 100}}>X Dating Mobile - Coming Soon!</Text>;
const LoginScreen = () => <Text style={{textAlign: 'center', marginTop: 100}}>Login Screen</Text>;
const DiscoverScreen = () => <Text style={{textAlign: 'center', marginTop: 100}}>Discover Screen</Text>;
const MessagesScreen = () => <Text style={{textAlign: 'center', marginTop: 100}}>Messages Screen</Text>;
const ProfileScreen = () => <Text style={{textAlign: 'center', marginTop: 100}}>Profile Screen</Text>;

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const Navigation = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Text style={{textAlign: 'center', marginTop: 100}}>Loading...</Text>;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <>
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default Navigation;