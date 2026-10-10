import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WebSocketService } from '../services/WebSocketService';
import { COLORS } from '../utils/constants';

const PowerButton = ({ icon, label, color, onPress }) => (
    <TouchableOpacity 
        style={[styles.powerButton, { borderColor: color }]} 
        onPress={onPress}
        activeOpacity={0.7}
    >
        <View style={[styles.powerIconContainer, { backgroundColor: color + '20' }]}>
            <MaterialCommunityIcons name={icon} size={28} color={color} />
        </View>
        <Text style={styles.powerLabel}>{label}</Text>
    </TouchableOpacity>
);

const AppButton = ({ icon, label, onPress }) => (
    <TouchableOpacity 
        style={styles.appButton} 
        onPress={onPress}
        activeOpacity={0.7}
    >
        <View style={styles.appIconContainer}>
            <MaterialCommunityIcons name={icon} size={20} color={COLORS.text} />
        </View>
        <Text style={styles.appLabel}>{label}</Text>
    </TouchableOpacity>
);

export const ControlScreen = () => {
    const ws = WebSocketService.getInstance();

    const handleSystemCommand = (action, requireConfirm, title) => {
        if (requireConfirm) {
            Alert.alert(
                `Confirmar ${title}`,
                `Tem certeza que deseja ${title.toLowerCase()} o PC?`,
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Sim', onPress: () => ws.sendSystemCommand(action), style: 'destructive' }
                ]
            );
        } else {
            ws.sendSystemCommand(action);
        }
    };

    const handleOpenProgram = (path) => {
        ws.sendOpenProgram(path);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scroll}>
                
                <View style={styles.header}>
                    <Text style={styles.title}>Painel de Controle</Text>
                    <Text style={styles.subtitle}>Comandos remotos rápidos</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ENERGIA & SISTEMA</Text>
                    <View style={styles.grid}>
                        <PowerButton 
                            icon="power" label="Desligar" color={COLORS.danger} 
                            onPress={() => handleSystemCommand('shutdown', true, 'Desligar')} 
                        />
                        <PowerButton 
                            icon="restart" label="Reiniciar" color={COLORS.warning} 
                            onPress={() => handleSystemCommand('restart', true, 'Reiniciar')} 
                        />
                        <PowerButton 
                            icon="sleep" label="Suspender" color="#4a90e2" 
                            onPress={() => handleSystemCommand('sleep', false, 'Suspender')} 
                        />
                        <PowerButton 
                            icon="lock" label="Bloquear" color="#9b59b6" 
                            onPress={() => handleSystemCommand('lock', false, 'Bloquear')} 
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>MÍDIA & VOLUME</Text>
                    <View style={styles.mediaGrid}>
                        <AppButton icon="volume-off" label="Mudo" onPress={() => handleSystemCommand('mute')} />
                        <AppButton icon="volume-medium" label="Diminuir" onPress={() => handleSystemCommand('vol_down')} />
                        <AppButton icon="volume-high" label="Aumentar" onPress={() => handleSystemCommand('vol_up')} />
                    </View>
                    <View style={[styles.mediaGrid, { marginTop: 15 }]}>
                        <AppButton icon="skip-previous" label="Anterior" onPress={() => handleSystemCommand('media_prev')} />
                        <AppButton icon="play-pause" label="Play/Pause" onPress={() => handleSystemCommand('media_play_pause')} />
                        <AppButton icon="skip-next" label="Próxima" onPress={() => handleSystemCommand('media_next')} />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ATALHOS RÁPIDOS</Text>
                    <View style={styles.grid}>
                        <AppButton icon="note-text-outline" label="Notepad" onPress={() => handleOpenProgram('notepad.exe')} />
                        <AppButton icon="calculator" label="Calculadora" onPress={() => handleOpenProgram('calc.exe')} />
                        <AppButton icon="folder-outline" label="Arquivos" onPress={() => handleOpenProgram('explorer.exe')} />
                        <AppButton icon="web" label="Navegador" onPress={() => handleOpenProgram('start microsoft-edge:')} />
                        <AppButton icon="console" label="CMD" onPress={() => handleOpenProgram('cmd.exe')} />
                        <AppButton icon="cog-outline" label="Config." onPress={() => handleOpenProgram('ms-settings:')} />
                    </View>
                </View>
                
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scroll: {
        padding: 24,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 30,
        marginTop: 10,
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
    section: {
        marginBottom: 35,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
        marginBottom: 15,
        letterSpacing: 2,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 15,
    },
    mediaGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    powerButton: {
        width: '47%',
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 4,
    },
    powerIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    powerIcon: {
        fontSize: 28,
    },
    powerLabel: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '600',
    },
    appButton: {
        flex: 1,
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.secondary,
        minWidth: '30%',
    },
    appIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    appIcon: {
        fontSize: 20,
    },
    appLabel: {
        color: COLORS.text,
        fontSize: 13,
        fontWeight: '500',
        textAlign: 'center',
    }
});
