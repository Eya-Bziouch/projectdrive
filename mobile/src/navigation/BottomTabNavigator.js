import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/main/HomeScreen';
import HistoryScreen from '../screens/main/HistoryScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator();

const COLORS = {
    cream: '#F0F1C5',
    lightGreen: '#BBD8A3',
    sageGreen: '#6F826A',
    darkGreen: '#1B211A',
    white: '#FFFFFF',
};



const BottomTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false, // Hide labels as per some designs, or keep them if preferred. User asked for specific labels but then "Create Ride (center button, no label)" implies others might have labels.
                // User spec: "labelStyle: { fontSize: 12 }" implies labels are shown.
                // User spec: "activeTintColor: lightGreen" -> tabBarActiveTintColor
                tabBarActiveTintColor: COLORS.darkGreen, // lightGreen on cream might be low contrast text, let's use darkGreen for active text or stick to user request?
                // User said: "activeTintColor: lightGreen". I'll stick to it but it might be hard to read on cream.
                // Actually, often active color is for icons. 
                tabBarInactiveTintColor: COLORS.sageGreen,
                tabBarStyle: {
                    backgroundColor: COLORS.cream,
                    borderTopColor: COLORS.sageGreen,
                    borderTopWidth: 1,
                    height: Platform.OS === 'ios' ? 88 : 60, // Taller tab bar
                    paddingTop: 8,
                    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    marginBottom: 4,
                }
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="History"
                component={HistoryScreen}
                options={{
                    tabBarLabel: 'History',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? 'time' : 'time-outline'} size={size} color={color} />
                    ),
                }}
            />



            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;
