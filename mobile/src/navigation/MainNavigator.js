import React from 'react';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import BottomTabNavigator from './BottomTabNavigator';
import RideDetailsScreen from '../screens/main/RideDetailsScreen';
import CreateRideScreen from '../screens/main/CreateRideScreen';
import ViewPassengersScreen from '../screens/ride/ViewPassengersScreen';
import PassengerProfileScreen from '../screens/ride/PassengerProfileScreen';
import PublicProfileScreen from '../screens/main/PublicProfileScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import ConversationListScreen from '../screens/chat/ConversationListScreen';

const Stack = createStackNavigator();

const MainNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            }}
        >
            <Stack.Screen name="Tabs" component={BottomTabNavigator} />
            <Stack.Screen name="CreateRide" component={CreateRideScreen} />
            <Stack.Screen name="RideDetails" component={RideDetailsScreen} />
            <Stack.Screen name="ViewPassengers" component={ViewPassengersScreen} />
            <Stack.Screen name="PassengerProfile" component={PassengerProfileScreen} />
            <Stack.Screen name="PublicProfile" component={PublicProfileScreen} />
            <Stack.Screen name="ConversationList" component={ConversationListScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
        </Stack.Navigator>
    );
};

export default MainNavigator;

