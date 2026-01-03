import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CreateRideScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Create Ride Screen</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F0F1C5',
    },
    text: {
        fontSize: 20,
        color: '#1B211A',
    },
});

export default CreateRideScreen;
