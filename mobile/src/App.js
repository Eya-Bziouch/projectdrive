import React, { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from './context/AuthContext';
import { RideProvider } from './context/RideContext';
import AppNavigator from './navigation/AppNavigator';
import Toast from 'react-native-toast-message';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
    React.useEffect(() => {
        const prepare = async () => {
            try {
                // Pre-load assets, fonts, or check session here
                await new Promise(resolve => setTimeout(resolve, 1000)); // Just a small delay for splash
            } catch (e) {
                console.warn(e);
            } finally {
                await SplashScreen.hideAsync();
            }
        };

        prepare();
    }, []);

    return (
        <AuthProvider>
            <RideProvider>
                <AppNavigator />
                <Toast />
            </RideProvider>
        </AuthProvider>
    );
}