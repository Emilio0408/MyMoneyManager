import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import {
    Button,
    Card,
    Icon,
    IconButton,
    Menu,
    Modal,
    Portal,
    Text,
    TextInput,
} from 'react-native-paper';
import { useMainAccountStore } from '../stores/useMainAccountStore';
import { formatCurrency } from '../utils/utils';

export default function MainAccountCard() {
    const saldo = useMainAccountStore((state) => state.saldo);
    const setSaldo = useMainAccountStore((state) => state.setSaldo);
    const [menuVisible, setMenuVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [menuKey, setMenuKey] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Animazioni
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        // Simula il caricamento iniziale
        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 600,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 500,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 400,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]).start(() => setIsLoading(false));
        }, 300);

        return () => clearTimeout(timer);
    }, []);

    const openMenu = () => {
        setMenuVisible(true);
        setMenuKey(prev => prev + 1);
    };

    const closeMenu = () => {
        setMenuVisible(false);
    };

    const openModal = () => {
        setMenuVisible(false);
        setTimeout(() => {
            setInputValue(String(saldo ?? 0));
            setModalVisible(true);
        }, 50);
    };

    const closeModal = () => setModalVisible(false);

    const submitNewSaldo = async () => {
        const parsed = parseFloat(inputValue.replace(',', '.'));
        if (!isNaN(parsed)) {
            await setSaldo(parsed);
        }
        closeModal();
    };

    return (
        <View style={{ padding: 16 }}>
            <Animated.View
                style={{
                    opacity: fadeAnim,
                    transform: [
                        { translateY: slideAnim },
                        { scale: scaleAnim }
                    ],
                }}
            >
                <Card mode="elevated" style={{
                    borderRadius: 12,
                    padding: 16,
                    backgroundColor: '#1a237e',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 12,
                    elevation: 8,
                }}>
                    <View style={{ minHeight: 150, padding: 10 }}>
                        {/* Header con icona, titolo e menu */}
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 20,
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <Icon
                                    source="credit-card"
                                    size={24}
                                    color="white"
                                />
                                <Text variant="titleMedium" style={{ color: 'white', fontWeight: 'bold' }}>
                                    Conto Principale
                                </Text>
                            </View>

                            <Menu
                                key={menuKey}
                                visible={menuVisible}
                                onDismiss={closeMenu}
                                anchor={
                                    <IconButton
                                        icon="dots-vertical"
                                        size={24}
                                        onPress={openMenu}
                                        accessibilityLabel="Opzioni conto principale"
                                        iconColor='white'
                                    />
                                }
                            >
                                <Menu.Item
                                    onPress={openModal}
                                    title="Modifica saldo"
                                />
                            </Menu>
                        </View>

                        {/* Saldo disponibile */}
                        <View>
                            <Text variant="bodySmall" style={{
                                marginTop: 8,
                                color: 'rgba(255,255,255,0.8)',
                                fontWeight: '600',
                                fontSize: 14,
                            }}>
                                Saldo disponibile
                            </Text>
                            <Text variant="headlineSmall" style={{
                                marginTop: 8,
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: 28,
                            }}>
                                {formatCurrency(saldo || 0)}
                            </Text>
                        </View>
                    </View>
                </Card>
            </Animated.View>

            {/* Modal per modifica saldo */}
            <Portal>
                <Modal
                    visible={modalVisible}
                    onDismiss={closeModal}
                    contentContainerStyle={{
                        margin: 32,
                        backgroundColor: 'white',
                        padding: 16,
                        borderRadius: 8,
                    }}
                >
                    <Text variant="titleMedium">Modifica saldo</Text>
                    <TextInput
                        label="Saldo"
                        mode="outlined"
                        keyboardType="numeric"
                        value={inputValue}
                        onChangeText={setInputValue}
                        style={{ marginTop: 12 }}
                        theme={{ colors: { primary: '#1a237e' } }}
                    />
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'flex-end',
                            marginTop: 16,
                        }}
                    >
                        <Button onPress={closeModal} textColor='#1a237e'>Annulla</Button>
                        <Button
                            onPress={submitNewSaldo}
                            mode="contained"
                            style={{ marginLeft: 12, backgroundColor: '#1a237e' }}
                        >
                            Salva
                        </Button>
                    </View>
                </Modal>
            </Portal>
        </View>
    );
}