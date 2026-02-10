import React, { useEffect } from 'react';
import { Text } from 'react-native';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './src/utils/navigationRef';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PaymentProvider } from './src/store/PaymentContext';
import { AuthProvider, useAuth } from './src/store/AuthContext';
import { AccessKeyProvider, useAccessKey } from './src/store/AccessKeyContext';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import EntryExitScreen from './src/screens/EntryExitScreen';
import ParkedVehiclesScreen from './src/screens/ParkedVehiclesScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import AccessKeyScreen from './src/screens/AccessKeyScreen';
import UserManagementScreen from './src/screens/UserManagementScreen';
import CameraScreen from './src/screens/CameraScreen';

enableScreens();

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Stack para as abas que podem ter navegação interna
function EntryExitStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EntryExit" component={EntryExitScreen} />
    </Stack.Navigator>
  );
}

function ParkedVehiclesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ParkedVehicles" component={ParkedVehiclesScreen} />
    </Stack.Navigator>
  );
}

function ReportsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Reports" component={ReportsScreen} />
    </Stack.Navigator>
  );
}

function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
      <Stack.Screen name="UserManagement" component={UserManagementScreen} />
    </Stack.Navigator>
  );
}

// Navigator com abas para usuários logados
function TabNavigator() {
  const { user } = useAuth();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#eee',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="EntryExitTab"
        component={EntryExitStack}
        options={{
          tabBarLabel: 'Entrada',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📝</Text>,
        }}
      />
      <Tab.Screen
        name="ParkedVehiclesTab"
        component={ParkedVehiclesStack}
        options={{
          tabBarLabel: 'No Pátio',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🚗</Text>,
        }}
      />
      {user?.role === 'admin' && (
        <Tab.Screen
          name="ReportsTab"
          component={ReportsStack}
          options={{
            tabBarLabel: 'Relatórios',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📊</Text>,
          }}
        />
      )}
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStack}
        options={{
          tabBarLabel: 'Config',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>⚙️</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

function MainNavigator() {
  const { isSignedIn } = useAuth();
  const { isValidated, loading } = useAccessKey();

  console.log('[MainNavigator] isSignedIn:', isSignedIn, 'isValidated:', isValidated, 'loading:', loading);

  // Se não tem chave validada, mostra tela de inserção
  if (!isValidated && !loading) {
    console.log('[MainNavigator] Mostrando AccessKeyScreen');
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
          <Stack.Screen name="HomeTabs" component={TabNavigator} />
          <Stack.Screen name="Camera" component={CameraScreen} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    console.log('App.js NEW2026: useEffect mounted');
  }, []);

  console.log('App.js NEW2026: render start');
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {console.log('App.js NEW2026: Inside GestureHandlerRootView')}
      <AccessKeyProvider>
        {console.log('App.js NEW2026: Inside AccessKeyProvider')}
        <PaymentProvider>
          {console.log('App.js NEW2026: Inside PaymentProvider')}
          <AuthProvider>
            {console.log('App.js NEW2026: Inside AuthProvider')}
            <NavigationContainer
              ref={navigationRef}
              onReady={() => console.log('NavigationContainer NEW2026: onReady')}
              onStateChange={() => console.log('NavigationContainer NEW2026: onStateChange')}
            >
              {console.log('App.js NEW2026: Inside NavigationContainer')}
              <MainNavigator />
            </NavigationContainer>
          </AuthProvider>
        </PaymentProvider>
      </AccessKeyProvider>
    </GestureHandlerRootView>
  );
}
