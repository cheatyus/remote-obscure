import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WebSocketService } from '../services/WebSocketService';
import { COLORS } from '../utils/constants';

const getProcessIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('chrome') || n.includes('edge') || n.includes('brave') || n.includes('opera') || n.includes('firefox')) return 'web';
    if (n.includes('discord')) return 'chat';
    if (n.includes('spotify')) return 'music';
    if (n.includes('code') || n.includes('studio')) return 'microsoft-visual-studio-code';
    if (n.includes('steam')) return 'steam';
    if (n.includes('explorer')) return 'folder';
    if (n.includes('cmd') || n.includes('powershell') || n.includes('terminal')) return 'console';
    if (n.includes('notepad') || n.includes('word')) return 'file-document-outline';
    if (n.includes('taskmgr')) return 'format-list-checks';
    if (n.includes('calc')) return 'calculator';
    if (n.includes('settings') || n.includes('system')) return 'cog';
    if (n.includes('obs')) return 'video-wireless';
    if (n.includes('slack')) return 'slack';
    return 'application-outline';
};

export const ProgramsScreen = () => {
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [customProgram, setCustomProgram] = useState('');
    const ws = WebSocketService.getInstance();

    const fetchPrograms = () => {
        setLoading(true);
        ws.requestProgramList();
    };

    useEffect(() => {
        const handleMessage = (msg) => {
            if (msg.type === 'programs') {
                setPrograms(msg.list);
                setLoading(false);
            } else if (msg.type === 'system_result' && (msg.action === 'program_close' || msg.action === 'program_open')) {
                if (msg.success) {
                    Alert.alert('Sucesso', msg.message);
                    fetchPrograms();
                } else {
                    Alert.alert('Erro', msg.message);
                }
            }
        };

        const originalCallback = ws.onMessageCallback;
        ws.onMessageCallback = (msg) => {
            handleMessage(msg);
            if (originalCallback) originalCallback(msg);
        };

        fetchPrograms();

        return () => {
            ws.onMessageCallback = originalCallback;
        };
    }, []);

    const confirmClose = (pid, name) => {
        Alert.alert(
            'Encerrar Programa',
            `Deseja forçar o encerramento do ${name}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Encerrar', onPress: () => ws.sendCloseProgram(pid), style: 'destructive' }
            ]
        );
    };

    const handleOpenCustom = () => {
        if (!customProgram.trim()) return;
        ws.sendOpenProgram(customProgram);
        setCustomProgram('');
    };

    const renderItem = ({ item }) => (
        <View style={styles.programCard}>
            <View style={styles.programIconContainer}>
                <MaterialCommunityIcons name={getProcessIcon(item.name)} size={24} color={COLORS.accent} />
            </View>
            <View style={styles.programInfo}>
                <Text style={styles.programName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.programTitle} numberOfLines={1}>
                    {item.title || 'Processo em segundo plano'}
                </Text>
                <Text style={styles.programPid}>PID: {item.pid}</Text>
            </View>
            <TouchableOpacity 
                style={styles.closeBtn} 
                onPress={() => confirmClose(item.pid, item.name)}
                activeOpacity={0.6}
            >
                <MaterialCommunityIcons name="close" size={18} color={COLORS.danger} />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView 
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Programas</Text>
                        <Text style={styles.subtitle}>Gerenciador de Tarefas</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.refreshBtn} 
                        onPress={fetchPrograms}
                    >
                        <MaterialCommunityIcons name="refresh" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={COLORS.accent} />
                        <Text style={styles.loadingText}>Carregando processos...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={programs}
                        keyExtractor={item => item.pid.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View style={styles.center}>
                                <Text style={styles.emptyText}>Nenhum programa encontrado.</Text>
                            </View>
                        }
                    />
                )}

                <View style={styles.footerCard}>
                    <Text style={styles.footerTitle}>ABRIR NOVO PROGRAMA</Text>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.input}
                            placeholder="ex: chrome.exe, calc"
                            placeholderTextColor={COLORS.textSecondary}
                            value={customProgram}
                            onChangeText={setCustomProgram}
                            onSubmitEditing={handleOpenCustom}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity 
                            style={styles.openBtn} 
                            onPress={handleOpenCustom}
                            activeOpacity={0.8}
                        >
                            <MaterialCommunityIcons name="play" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>
                </View>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: COLORS.text,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginTop: 5,
    },
    refreshBtn: {
        backgroundColor: COLORS.surface,
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.secondary,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    refreshIcon: {
        fontSize: 20,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: COLORS.textSecondary,
        marginTop: 15,
        fontSize: 16,
    },
    emptyText: {
        color: COLORS.textSecondary,
        fontSize: 16,
        fontStyle: 'italic',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    programCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.secondary,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    programIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.accent + '40',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        borderWidth: 1,
        borderColor: COLORS.accent,
    },
    programIconLetter: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    programInfo: {
        flex: 1,
        marginRight: 10,
    },
    programName: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    programTitle: {
        color: COLORS.textSecondary,
        fontSize: 13,
        marginBottom: 4,
    },
    programPid: {
        color: COLORS.accent,
        fontSize: 11,
        fontWeight: '600',
    },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.danger + '20',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.danger,
    },
    closeBtnText: {
        color: COLORS.danger,
        fontSize: 16,
        fontWeight: '900',
    },
    footerCard: {
        backgroundColor: COLORS.surface,
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: COLORS.secondary,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    footerTitle: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 12,
        letterSpacing: 1.5,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 12,
    },
    input: {
        flex: 1,
        backgroundColor: COLORS.background,
        color: COLORS.text,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.secondary,
        fontSize: 16,
    },
    openBtn: {
        backgroundColor: COLORS.success,
        width: 54,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.success,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 3,
    },
    openBtnText: {
        color: '#000',
        fontSize: 18,
    }
});
