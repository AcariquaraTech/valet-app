import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { PaymentProvider } from './src/store/PaymentContext';
import { AuthProvider, useAuth } from './src/store/AuthContext';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';

const Stack = createStackNavigator();

function MainNavigator() {
  const { isSignedIn } = useAuth();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isSignedIn ? (
        <Stack.Screen name="Home" component={HomeScreen} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PaymentProvider>
        <NavigationContainer>
          <MainNavigator />
        </NavigationContainer>
      </PaymentProvider>
    </AuthProvider>
  );
}
