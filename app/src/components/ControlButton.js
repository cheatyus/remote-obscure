import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

export const ControlButton = ({ icon, label, color = COLORS.accent, onPress, size = 'large' }) => {
    const isSmall = size === 'small';
    return (
        <TouchableOpacity 
            style={[styles.button, { backgroundColor: color, padding: isSmall ? 10 : 20 }]} 
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text style={[styles.icon, { fontSize: isSmall ? 20 : 32 }]}>{icon}</Text>
            {label && <Text style={[styles.label, { fontSize: isSmall ? 12 : 16 }]}>{label}</Text>}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        margin: 8,
        flex: 1,
    },
    icon: {
        marginBottom: 8,
    },
    label: {
        color: COLORS.text,
        fontWeight: 'bold',
        textAlign: 'center',
    }
});
