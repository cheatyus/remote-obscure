import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

const ROWS = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
];

export const VirtualKeyboard = ({ wsService, onClose }) => {
    const [modifiers, setModifiers] = useState({ ctrl: false, alt: false, shift: false, win: false });

    const toggleModifier = (mod) => {
        setModifiers(prev => ({ ...prev, [mod]: !prev[mod] }));
    };

    const handleKeyPress = (key) => {
        const activeMods = Object.keys(modifiers).filter(k => modifiers[k]);
        const keyToSend = modifiers.shift && key.length === 1 ? key.toUpperCase() : key;
        
        if (activeMods.length > 0) {
            wsService.sendKeyCombo([...activeMods, keyToSend]);
        } else if (key.length === 1) {
            wsService.sendKeyPress(keyToSend);
        } else {
            wsService.sendSpecialKey(key);
        }
        
        if (!modifiers.shift) {
            setModifiers({ ctrl: false, alt: false, shift: false, win: false });
        }
    };

    const renderKey = (key, label = key, style = {}) => (
        <TouchableOpacity 
            key={key} 
            style={[styles.key, style]} 
            onPress={() => handleKeyPress(key)}
        >
            <Text style={styles.keyText}>{modifiers.shift && label.length === 1 ? label.toUpperCase() : label}</Text>
        </TouchableOpacity>
    );

    const renderModKey = (mod, label) => (
        <TouchableOpacity 
            key={mod} 
            style={[styles.key, modifiers[mod] && styles.activeMod]} 
            onPress={() => toggleModifier(mod)}
        >
            <Text style={styles.keyText}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose}>
                    <Text style={styles.closeText}>Fechar Teclado</Text>
                </TouchableOpacity>
            </View>
            
            <View style={styles.row}>
                {renderModKey('ctrl', 'Ctrl')}
                {renderModKey('alt', 'Alt')}
                {renderModKey('shift', 'Shift')}
                {renderModKey('win', 'Win')}
                {renderKey('esc', 'Esc')}
                {renderKey('tab', 'Tab')}
            </View>

            {ROWS.map((row, i) => (
                <View key={i} style={styles.row}>
                    {row.map(k => renderKey(k))}
                </View>
            ))}

            <View style={styles.row}>
                {renderKey('space', 'Espaco', { flex: 3 })}
                {renderKey('backspace', 'Apagar', { flex: 1, backgroundColor: COLORS.danger })}
                {renderKey('enter', 'Enter', { flex: 1, backgroundColor: COLORS.accent })}
            </View>
            
            <View style={styles.row}>
                {renderKey('left', '<-')}
                {renderKey('up', '^')}
                {renderKey('down', 'v')}
                {renderKey('right', '->')}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(26, 26, 46, 0.85)',
        paddingBottom: 10,
        paddingTop: 5,
        borderTopWidth: 1,
        borderColor: COLORS.secondary,
    },
    header: {
        alignItems: 'center',
        marginBottom: 5,
    },
    closeText: {
        color: COLORS.textSecondary,
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 2,
        paddingHorizontal: 2,
    },
    key: {
        backgroundColor: 'rgba(22, 33, 62, 0.7)',
        margin: 1,
        paddingVertical: 8,
        paddingHorizontal: 5,
        borderRadius: 5,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeMod: {
        backgroundColor: COLORS.success,
    },
    keyText: {
        color: COLORS.text,
        fontSize: 14,
    }
});
