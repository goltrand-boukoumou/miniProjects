// Point d'entrée Expo — navigation par onglets (bottom tabs)
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";

import HomeScreen from "./src/screens/HomeScreen";
import AddLinkScreen from "./src/screens/AddLinkScreen";
import { theme } from "./src/theme";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: theme.colors.card },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.muted,
        }}
      >
        <Tab.Screen
          name="Accueil"
          component={HomeScreen}
          options={{ tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🔗</Text> }}
        />
        <Tab.Screen
          name="Ajouter"
          component={AddLinkScreen}
          options={{ tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>➕</Text> }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
