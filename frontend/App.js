import React, { useEffect } from 'react';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
export const navigationRef = createNavigationContainerRef();
import { createStackNavigator } from '@react-navigation/stack';
import { PaymentProvider } from './src/store/PaymentContext';
import { AuthProvider, useAuth } from './src/store/AuthContext';
import { AccessKeyProvider, useAccessKey } from './src/store/AccessKeyContext';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import AccessKeyScreen from './src/screens/AccessKeyScreen';

const Stack = createStackNavigator();

function MainNavigator() {
  const { isSignedIn } = useAuth();
  const { isValidated, loading } = useAccessKey();

  // Se não tem chave validada, mostra tela de inserção
  if (!isValidated && !loading) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AccessKey" component={AccessKeyScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isSignedIn ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="ReportsScreen" component={ReportsScreen} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    console.log('App.js: useEffect mounted');
  }, []);

  console.log('App.js: render start');
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {console.log('App.js: Inside GestureHandlerRootView')}
      <AccessKeyProvider>
        {console.log('App.js: Inside AccessKeyProvider')}
        <PaymentProvider>
          {console.log('App.js: Inside PaymentProvider')}
          <AuthProvider>
            {console.log('App.js: Inside AuthProvider')}
            <NavigationContainer
              ref={navigationRef}
              onReady={() => console.log('NavigationContainer: onReady')}
              onStateChange={() => console.log('NavigationContainer: onStateChange')}
            >
              {console.log('App.js: Inside NavigationContainer')}
              <MainNavigator />
            </NavigationContainer>
          </AuthProvider>
        </PaymentProvider>
      </AccessKeyProvider>
    </GestureHandlerRootView>
  );
}
