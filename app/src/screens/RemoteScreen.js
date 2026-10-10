import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WebSocketService } from '../services/WebSocketService';
import { VirtualKeyboard } from '../components/VirtualKeyboard';
import { COLORS } from '../utils/constants';

export const RemoteScreen = () => {
    const [imageUri, setImageUri] = useState(null);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [trackpadMode, setTrackpadMode] = useState(true);
    const [isLandscape, setIsLandscape] = useState(true);
    const insets = useSafeAreaInsets();
    
    // Zoom state
    const [scale, setScale] = useState(1);
    const initialDistance = useRef(null);
    const initialScale = useRef(1);

    const ws = WebSocketService.getInstance();
    
    // Trackpad & Drag references
    const lastMoveTime = useRef(0);
    const lastTouchPos = useRef({ x: 0, y: 0 });
    const touchStartPos = useRef({ x: 0, y: 0 });
    const touchStartTime = useRef(0);
    const isMultiTouch = useRef(false);
    
    // Double tap & Drag state
    const lastTapTime = useRef(0);
    const isDragging = useRef(false);

    useEffect(() => {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

        ws.onFrameCallback = (uri) => {
            setImageUri(uri);
        };
        
        return () => {
            ws.onFrameCallback = null;
            ScreenOrientation.unlockAsync();
        };
    }, []);

    const toggleOrientation = async () => {
        if (isLandscape) {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
            setIsLandscape(false);
        } else {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
            setIsLandscape(true);
        }
    };

    const handleTouchStart = (e) => {
        const touches = e.nativeEvent.touches;
        const now = Date.now();

        if (touches.length === 2) {
            isMultiTouch.current = true;
            // Para pinch-to-zoom
            const t1 = touches[0];
            const t2 = touches[1];
            initialDistance.current = Math.hypot(t1.pageX - t2.pageX, t1.pageY - t2.pageY);
            initialScale.current = scale;
            lastTouchPos.current = { x: t1.pageX, y: t1.pageY };
            return;
        }
        
        isMultiTouch.current = false;
        const touch = touches[0];
        lastTouchPos.current = { x: touch.pageX, y: touch.pageY };
        touchStartPos.current = { x: touch.pageX, y: touch.pageY };
        touchStartTime.current = now;

        // Verifica se Ã© um double tap (menos de 300ms do Ãºltimo tap)
        if (now - lastTapTime.current < 300) {
            // Inicia o arrasto!
            isDragging.current = true;
            if (trackpadMode) {
                ws.sendMouseDown('left');
            }
        }
    };

    const handleTouchMove = (e) => {
        const touches = e.nativeEvent.touches;
        const now = Date.now();
        if (now - lastMoveTime.current < 33) return; // ~30fps max
        lastMoveTime.current = now;

        if (touches.length === 2) {
            const t1 = touches[0];
            const t2 = touches[1];
            const currentDistance = Math.hypot(t1.pageX - t2.pageX, t1.pageY - t2.pageY);
            
            // Se afastou/juntou os dedos -> Zoom
            if (initialDistance.current) {
                const ratio = currentDistance / initialDistance.current;
                const newScale = Math.max(1, Math.min(5, initialScale.current * ratio));
                setScale(newScale);
            }

            // Two finger scroll (arrastar com 2 dedos)
            const currentY = t1.pageY;
            const deltaY = currentY - lastTouchPos.current.y;
            
            if (Math.abs(deltaY) > 5) {
                const scrollAmount = deltaY > 0 ? 1 : -1;
                ws.sendScroll(scrollAmount * 100);
                lastTouchPos.current.y = currentY;
            }
            return;
        }

        if (touches.length === 1 && !isMultiTouch.current) {
            const touch = touches[0];
            
            if (trackpadMode) {
                // Movimento relativo
                const dx = touch.pageX - lastTouchPos.current.x;
                const dy = touch.pageY - lastTouchPos.current.y;
                
                // Reduz sensibilidade ao ter zoom aplicado
                const sensitivity = 2.0 / scale;
                if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
                    ws.sendMouseMoveRelative(dx * sensitivity, dy * sensitivity);
                }
            } else {
                // Movimento absoluto (ignora arrastar se nÃ£o estiver em trackpad, sÃ³ manda o click no final)
                if (isDragging.current) {
                    const { width, height } = Dimensions.get('window');
                    ws.sendMouseMove(touch.locationX / width, touch.locationY / height);
                }
            }
            
            lastTouchPos.current = { x: touch.pageX, y: touch.pageY };
        }
    };

    const handleTouchEnd = (e) => {
        initialDistance.current = null;

        if (isMultiTouch.current) {
            isMultiTouch.current = false;
            return;
        }

        const now = Date.now();
        const touchDuration = now - touchStartTime.current;
        const touch = e.nativeEvent.changedTouches[0];
        
        const dx = Math.abs(touch.pageX - touchStartPos.current.x);
        const dy = Math.abs(touch.pageY - touchStartPos.current.y);

        // Se estava arrastando, solta o mouse
        if (isDragging.current) {
            if (trackpadMode) {
                ws.sendMouseUp('left');
            } else {
                ws.sendMouseUp('left');
            }
            isDragging.current = false;
            lastTapTime.current = 0; // reseta
            return;
        }

        // Tap simples (clique)
        if (touchDuration < 250 && dx < 10 && dy < 10) {
            if (trackpadMode) {
                ws.send({ type: 'mouse_click', button: 'left' });
            } else {
                const { width, height } = Dimensions.get('window');
                ws.sendMouseClick(touch.locationX / width, touch.locationY / height, 'left');
            }
            lastTapTime.current = now;
        } 
        // Long press (clique direito)
        else if (touchDuration > 500 && dx < 10 && dy < 10) {
            if (trackpadMode) {
                ws.send({ type: 'mouse_click', button: 'right' });
            } else {
                const { width, height } = Dimensions.get('window');
                ws.sendMouseClick(touch.locationX / width, touch.locationY / height, 'right');
            }
        }
    };

    return (
        <View style={styles.container}>
            {imageUri ? (
                <View 
                    style={styles.imageContainer}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <Image 
                        source={{ uri: imageUri }} 
                        style={[styles.image, { transform: [{ scale: scale }] }]} 
                        contentFit="contain"
                        cachePolicy="none"
                        transition={0}
                    />
                </View>
            ) : (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.accent} />
                    <Text style={styles.loadingText}>Aguardando tela...</Text>
                </View>
            )}

            <View style={[styles.fabContainer, { right: Math.max(20, insets.right + 20), bottom: Math.max(20, insets.bottom + 20) }]}>
    <TouchableOpacity style={styles.fab} onPress={toggleOrientation}>
        <MaterialCommunityIcons name="screen-rotation" size={24} color={COLORS.text} />
    </TouchableOpacity>
    <TouchableOpacity style={styles.fab} onPress={() => setScale(1)} activeOpacity={0.7}>
        <MaterialCommunityIcons name="magnify-minus" size={24} color={COLORS.text} />
    </TouchableOpacity>
    <TouchableOpacity style={styles.fab} onPress={() => setKeyboardVisible(!keyboardVisible)}>
        <MaterialCommunityIcons name="keyboard" size={24} color={COLORS.text} />
    </TouchableOpacity>
    <TouchableOpacity style={[styles.fab, trackpadMode && styles.fabActive]} onPress={() => setTrackpadMode(!trackpadMode)}>
        <MaterialCommunityIcons name={trackpadMode ? "gesture-swipe" : "cursor-default-click"} size={24} color={COLORS.text} />
    </TouchableOpacity>
</View>

            {keyboardVisible && (
                <VirtualKeyboard 
                    wsService={ws} 
                    onClose={() => setKeyboardVisible(false)} 
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: COLORS.textSecondary,
        marginTop: 10,
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    fabContainer: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        gap: 15,
    },
    fab: {
        backgroundColor: COLORS.surface,
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        borderWidth: 1,
        borderColor: COLORS.secondary,
    },
    fabActive: {
        backgroundColor: COLORS.accent,
    },
    fabIcon: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    }
});

