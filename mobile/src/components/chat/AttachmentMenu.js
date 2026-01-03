import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Simple option component
const AttachmentOption = ({ icon, label, color, onPress }) => (
    <TouchableOpacity style={styles.option} onPress={onPress}>
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
            <Ionicons name={icon} size={24} color="#FFF" />
        </View>
        <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
);

const AttachmentMenu = ({ visible, onClose, onPickImage, onLaunchCamera, onPickVideo, onRecordVoice }) => {
    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                {/* Transparent backdrop to close menu */}
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    onPress={onClose}
                    activeOpacity={1}
                />

                {/* Menu Container */}
                <View style={styles.container}>
                    <View style={styles.row}>
                        <AttachmentOption
                            icon="image"
                            label="Gallery"
                            color="#BF59CF"
                            onPress={onPickImage}
                        />
                        <AttachmentOption
                            icon="camera"
                            label="Camera"
                            color="#D3396D"
                            onPress={onLaunchCamera}
                        />
                        <AttachmentOption
                            icon="videocam"
                            label="Video"
                            color="#E54242"
                            onPress={onPickVideo}
                        />
                    </View>
                    {/* Audio is often handled directly in input bar in WA, 
                            but requested in menu or separate mic button. 
                            If in menu: */}
                    <View style={styles.row}>
                        <AttachmentOption
                            icon="mic"
                            label="Audio"
                            color="#F39C12"
                            onPress={onRecordVoice}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#FFF',
        paddingVertical: 20,
        paddingHorizontal: 30, // WA style has padding
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingBottom: 40,
        height: 250, // Fixed height or auto
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    option: {
        alignItems: 'center',
        width: 70, // Fixed width
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 12,
        color: '#555',
    }
});

export default AttachmentMenu;
