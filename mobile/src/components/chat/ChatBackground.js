import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const ChatBackground = () => {
    // Generate random positions once using useMemo to avoid re-render flickering
    const pattern = useMemo(() => {
        const items = [];
        const count = 50; // Slightly more density

        for (let i = 0; i < count; i++) {
            const randomLeft = Math.random() * width;
            const randomTop = Math.random() * height;
            const randomRotation = Math.random() * 360;

            // varied size for "spontaneous" look
            const randomScale = 0.5 + Math.random() * 0.8; // Scale factor
            const baseSize = 30;
            const size = baseSize * randomScale;

            // Varied opacity for depth effect
            const randomOpacity = 0.04 + Math.random() * 0.08;

            items.push(
                <View
                    key={i}
                    style={[
                        styles.iconContainer,
                        {
                            left: randomLeft,
                            top: randomTop,
                            transform: [
                                { rotate: `${randomRotation}deg` }
                            ]
                        }
                    ]}
                >
                    <Ionicons
                        name="car-sport"
                        size={size}
                        color={`rgba(0,0,0, ${randomOpacity})`}
                    />
                </View>
            );
        }
        return items;
    }, []);

    return (
        <View style={styles.container}>
            {pattern}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#EFE7DE',
        overflow: 'hidden', // Cut off icons that go outside bounds
    },
    iconContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default ChatBackground;
