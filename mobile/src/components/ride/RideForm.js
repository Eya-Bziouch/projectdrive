import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import Input from '../common/Input';
import Button from '../common/Button';
const colors = require('../../styles/colors');
const { theme } = require('../../styles/theme');

const RideForm = ({
    initialValues,
    onSubmit,
    isLoading,
    isEditMode = false
}) => {
    // Helper to extract safe initial string values
    const getInitialSeats = (vals) => {
        if (!vals) return '';
        if (vals.availableSeats != null) return String(vals.availableSeats);
        if (vals.neededSeats != null) return String(vals.neededSeats); // Map neededSeats for editing passenger rides
        return '';
    };

    const [formData, setFormData] = useState({
        departure: initialValues?.departure || '',
        destination: initialValues?.destination || '',
        date: initialValues?.date ? new Date(initialValues.date) : new Date(),
        availableSeats: getInitialSeats(initialValues),
        type: initialValues?.type || 'DRIVER',
        price: initialValues?.price != null ? String(initialValues.price) : '',
        description: initialValues?.description || '',
    });

    const [errors, setErrors] = useState({});
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Sync state with props when entering/re-entering screen
    // CRITICAL: Checks for value equality to avoid unnecessary resets if object ref changes
    React.useEffect(() => {
        if (initialValues) {
            setFormData(prev => ({
                ...prev,
                departure: initialValues.departure || '',
                destination: initialValues.destination || '',
                date: initialValues.date ? new Date(initialValues.date) : new Date(),
                availableSeats: getInitialSeats(initialValues),
                type: initialValues.type || 'DRIVER',
                price: initialValues.price != null ? String(initialValues.price) : '',
                description: initialValues.description || '',
            }));
        }
    }, [initialValues]);

    const validate = () => {
        const newErrors = {};
        if (!formData.departure.trim()) newErrors.departure = 'Departure is required';
        if (!formData.destination.trim()) newErrors.destination = 'Destination is required';

        // Validate seats (generic field used for both available and needed)
        // Check for empty string or NaN
        if (formData.availableSeats === '' || isNaN(formData.availableSeats)) {
            newErrors.availableSeats = 'Number of seats is required';
        } else {
            const seats = parseInt(formData.availableSeats);
            if (seats < 0) {
                newErrors.availableSeats = 'Seats cannot be negative';
            } else if (!isEditMode && seats < 1) {
                newErrors.availableSeats = 'At least 1 seat required';
            }
        }

        if (formData.type === 'DRIVER') {
            if (formData.price === '' || isNaN(formData.price) || parseFloat(formData.price) < 0) {
                newErrors.price = 'Valid price is required';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            const seatCount = parseInt(formData.availableSeats);

            const submissionData = {
                ...formData,
                availableSeats: formData.type === 'DRIVER' ? seatCount : undefined,
                neededSeats: formData.type === 'PASSENGER' ? seatCount : undefined,
                price: formData.type === 'DRIVER' ? parseFloat(formData.price) : undefined,
                date: formData.date.toISOString().split('T')[0],
                time: formData.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
            };
            onSubmit(submissionData);
        }
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (event.type === 'set' && selectedDate) {
            setFormData(prev => {
                const current = new Date(prev.date);
                current.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                return { ...prev, date: current };
            });
        }
    };

    const handleTimeChange = (event, selectedTime) => {
        setShowTimePicker(false);
        if (event.type === 'set' && selectedTime) {
            setFormData(prev => {
                const current = new Date(prev.date);
                current.setHours(selectedTime.getHours(), selectedTime.getMinutes());
                return { ...prev, date: current };
            });
        }
    };

    const toggleType = (selectedType) => {
        setFormData(prev => ({ ...prev, type: selectedType }));
    };

    // Functional update wrapper for simple text fields
    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Input
                label="Departure Location"
                placeholder="e.g., Student Residence Hall"
                value={formData.departure}
                onChangeText={(text) => updateField('departure', text)}
                error={errors.departure}
                rightElement={<Ionicons name="location-outline" size={20} color={colors.sageGreen} />}
            />

            <Input
                label="Destination Location"
                placeholder="e.g., University Main Campus"
                value={formData.destination}
                onChangeText={(text) => updateField('destination', text)}
                error={errors.destination}
                rightElement={<Ionicons name="flag-outline" size={20} color={colors.sageGreen} />}
            />

            <View style={styles.row}>
                <View style={styles.halfInput}>
                    <Text style={styles.label}>Date</Text>
                    <TouchableOpacity
                        style={[styles.pickerButton, errors.date && styles.pickerError]}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text style={styles.pickerText}>{formData.date.toLocaleDateString()}</Text>
                        <Ionicons name="calendar-outline" size={20} color={colors.sageGreen} />
                    </TouchableOpacity>
                </View>

                <View style={[styles.halfInput, { marginLeft: 16 }]}>
                    <Text style={styles.label}>Time</Text>
                    <TouchableOpacity
                        style={[styles.pickerButton, errors.date && styles.pickerError]}
                        onPress={() => setShowTimePicker(true)}
                    >
                        <Text style={styles.pickerText}>
                            {formData.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        <Ionicons name="time-outline" size={20} color={colors.sageGreen} />
                    </TouchableOpacity>
                </View>
            </View>

            {showDatePicker && (
                <DateTimePicker
                    value={formData.date}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    minimumDate={new Date()}
                    onChange={handleDateChange}
                />
            )}

            {showTimePicker && (
                <DateTimePicker
                    value={formData.date}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleTimeChange}
                />
            )}

            <Input
                label={formData.type === 'DRIVER' ? "Available Seats" : "Needed Seats"}
                placeholder="e.g., 3"
                value={formData.availableSeats}
                onChangeText={(text) => updateField('availableSeats', text.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                error={errors.availableSeats}
            />


            {/* Hide Type Selector in Edit Mode - Type is immutable during edit */
                !isEditMode && (
                    <>
                        <Text style={styles.label}>Ride Type</Text>
                        <View style={styles.typeContainer}>
                            <TouchableOpacity
                                style={[styles.typeButton, formData.type === 'DRIVER' && styles.typeButtonActive]}
                                onPress={() => toggleType('DRIVER')}
                            >
                                <Text style={[styles.typeText, formData.type === 'DRIVER' && styles.typeTextActive]}>
                                    Publish as Driver
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.typeButton, formData.type === 'PASSENGER' && styles.typeButtonActive]}
                                onPress={() => toggleType('PASSENGER')}
                            >
                                <Text style={[styles.typeText, formData.type === 'PASSENGER' && styles.typeTextActive]}>
                                    Publish as Passenger
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}

            {formData.type === 'DRIVER' && (
                <Input
                    label="Price (TND)"
                    placeholder="e.g., 10"
                    value={formData.price}
                    onChangeText={(text) => updateField('price', text)}
                    keyboardType="decimal-pad"
                    error={errors.price}
                />
            )}

            <Input
                label="Description (Optional)"
                placeholder="Additional notes..."
                value={formData.description}
                onChangeText={(text) => updateField('description', text)}
                multiline
                numberOfLines={3}
                style={{ height: 100 }}
                maxLength={200}
            />

            <Button
                text={isEditMode ? "Update Ride" : "Publish Ride"}
                onPress={handleSubmit}
                loading={isLoading}
                size="large"
                style={styles.submitButton}
            />

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    contentContainer: {
        padding: 16,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    halfInput: {
        flex: 1,
    },
    label: {
        ...theme.typography.label,
        color: colors.darkGreen,
        marginBottom: 4,
        fontWeight: '500',
    },
    pickerButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: colors.cream,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.sageGreen, // Default border
    },
    pickerError: {
        borderColor: colors.error,
    },
    pickerText: {
        fontSize: 16,
        color: colors.darkGreen,
    },
    typeContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        backgroundColor: colors.cream,
        borderRadius: 12,
        padding: 4,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 10,
    },
    typeButtonActive: {
        backgroundColor: colors.lightGreen,
    },
    typeText: {
        fontWeight: '600',
        color: colors.sageGreen,
    },
    typeTextActive: {
        color: colors.darkGreen,
    },
    submitButton: {
        marginTop: 16,
        marginBottom: 32,
    }
});

export default RideForm;
