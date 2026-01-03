import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import * as Linking from 'expo-linking';

const prefix = Linking.createURL('/');

const linking = {
    prefixes: [prefix],
    config: {
        screens: {
            Auth: {
                screens: {
                    Login: 'login',
                    SignUp: 'signup',
                },
            },
            Main: {
                screens: {
                    Tabs: {
                        screens: {
                            Home: 'home',
                            History: 'history',
                            Profile: 'profile',
                        }
                    },
                    CreateRide: 'create-ride',
                    RideDetails: 'ride/:rideId',
                },
            },
        },
    },
};

const AppNavigator = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6F826A" />
            </View>
        );
    }

    return (
        <NavigationContainer linking={linking}>
            {isAuthenticated ? (
                <MainNavigator />
            ) : (
                <AuthNavigator />
            )}
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F0F1C5',
    },
});

export default AppNavigator;
