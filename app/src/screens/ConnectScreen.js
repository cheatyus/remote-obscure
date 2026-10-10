import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebSocketService } from '../services/WebSocketService';
import { COLORS, DEFAULT_PORT, APP_NAME } from '../utils/constants';

export const ConnectScreen = ({ navigation }) => {
    const [ip, setIp] = useState('');
    const [port, setPort] = useState(DEFAULT_PORT);
    const [password, setPassword] = useState('');
    const [connecting, setConnecting] = useState(false);

    useEffect(() => {
        const loadSettings = async () => {
            const savedIp = await AsyncStorage.getItem('saved_ip');
            const savedPort = await AsyncStorage.getItem('saved_port');
            if (savedIp) setIp(savedIp);
            if (savedPort) setPort(savedPort);
        };
        loadSettings();
    }, []);

    const handleConnect = async () => {
        if (!ip || !password) {
            Alert.alert('Aviso', 'Preencha todos os campos!');
            return;
        }

        setConnecting(true);
        await AsyncStorage.setItem('saved_ip', ip);
        await AsyncStorage.setItem('saved_port', port);

        const ws = WebSocketService.getInstance();
        
        ws.onConnectCallback = () => {
            setConnecting(false);
            navigation.replace('MainTabs');
        };
        
        ws.onMessageCallback = (msg) => {
            if (msg.type === 'error') {
                setConnecting(false);
                Alert.alert('Erro de Conexão', msg.message);
            }
        };

        ws.onDisconnectCallback = () => {
            setConnecting(false);
        };

        ws.connect(ip, port || DEFAULT_PORT, password);
    };

    const handleClearCache = async () => {
        await AsyncStorage.removeItem('saved_ip');
        await AsyncStorage.removeItem('saved_port');
        setIp('');
        setPort(DEFAULT_PORT);
        setPassword('');
        
        const ws = WebSocketService.getInstance();
        ws.disconnect();
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView 
                style={styles.container} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.scroll}>
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <MaterialCommunityIcons name="remote-desktop" size={40} color={COLORS.accent} />
                        </View>
                        <Text style={styles.logo}>{APP_NAME}</Text>
                        <Text style={styles.subtitle}>Acesse seu PC de qualquer lugar</Text>
                    </View>
                    
                    <View style={styles.card}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Endereço IP</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="ex: 192.168.1.100"
                                placeholderTextColor={COLORS.textSecondary}
                                value={ip}
                                onChangeText={setIp}
                                keyboardType="numbers-and-punctuation"
                                autoCapitalize="none"
                            />
                        </View>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Porta</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="8765"
                                placeholderTextColor={COLORS.textSecondary}
                                value={port}
                                onChangeText={setPort}
                                keyboardType="numeric"
                            />
                        </View>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Senha do Servidor</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                placeholderTextColor={COLORS.textSecondary}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>
                        
                        <TouchableOpacity 
                            style={styles.connectButton} 
                            onPress={handleConnect}
                            disabled={connecting}
                            activeOpacity={0.8}
                        >
                            {connecting ? (
                                <ActivityIndicator color={COLORS.text} size="small" />
                            ) : (
                                <Text style={styles.connectButtonText}>CONECTAR</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity 
                        style={styles.resetButton} 
                        onPress={handleClearCache}
                    >
                        <Text style={styles.resetText}>Limpar Histórico e Resetar Conexão</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flex: 1,
    },
    scroll: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconContainer: {
        width: 80,
        height: 80,
        backgroundColor: COLORS.surface,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.secondary,
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    headerIcon: {
        fontSize: 40,
    },
    logo: {
        fontSize: 32,
        fontWeight: '900',
        color: COLORS.text,
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginTop: 5,
    },
    card: {
        backgroundColor: COLORS.surface,
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: COLORS.secondary,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 8,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    input: {
        backgroundColor: COLORS.background,
        color: COLORS.text,
        padding: 16,
        borderRadius: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: COLORS.secondary,
    },
    connectButton: {
        backgroundColor: COLORS.success,
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: COLORS.success,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 5,
    },
    connectButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    resetButton: {
        marginTop: 30,
        padding: 10,
        alignItems: 'center',
    },
    resetText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        textDecorationLine: 'underline',
    }
});
