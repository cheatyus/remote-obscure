import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ConnectScreen } from './src/screens/ConnectScreen';
import { RemoteScreen } from './src/screens/RemoteScreen';
import { ControlScreen } from './src/screens/ControlScreen';
import { ProgramsScreen } from './src/screens/ProgramsScreen';
import { COLORS } from './src/utils/constants';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const DarkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.background,
    card: COLORS.surface,
    text: COLORS.text,
    border: COLORS.secondary,
    primary: COLORS.accent,
  },
};

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.secondary,
        },
        tabBarActiveTintColor: COLORS.success,
        tabBarInactiveTintColor: COLORS.textSecondary,
      }}
    >
      <Tab.Screen 
        name="Remote" 
        component={RemoteScreen} 
        options={{ tabBarIcon: ({ color }) => <MaterialCommunityIcons name="monitor-cellphone" size={26} color={color} /> }}
      />
      <Tab.Screen 
        name="Controles" 
        component={ControlScreen} 
        options={{ tabBarIcon: ({ color }) => <MaterialCommunityIcons name="remote" size={26} color={color} /> }}
      />
      <Tab.Screen 
        name="Programas" 
        component={ProgramsScreen} 
        options={{ tabBarIcon: ({ color }) => <MaterialCommunityIcons name="format-list-bulleted" size={26} color={color} /> }}
      />
    </Tab.Navigator>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={DarkTheme}>
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
          <Stack.Screen name="Connect" component={ConnectScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
