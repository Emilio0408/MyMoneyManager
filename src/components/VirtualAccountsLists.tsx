import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Alert, Animated, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Checkbox, IconButton, ProgressBar } from 'react-native-paper';
import { VirtualAccount } from '../repositories/virtualAccountRepository';
import { useVirtualAccountsStore } from '../stores/useVirtualAccountsStore';

// =============================================================================
// TIPI E INTERFACCE
// =============================================================================

interface AnimationRefs {
    values: { [key: number]: Animated.Value };
    swipeables: { [key: number]: Swipeable | null };
}

// =============================================================================
// COMPONENTE PRINCIPALE
// =============================================================================

export default function VirtualAccountsLists() {
    // ---------------------------------------------------------------------------
    // STATE E REF
    // ---------------------------------------------------------------------------

    const router = useRouter();

    // Store Zustand
    const contiVirtuali = useVirtualAccountsStore((state) => state.virtualAccounts);
    const insertVirtualAccounts = useVirtualAccountsStore((state) => state.insertVirtualAccount);
    const deleteVirtualAccount = useVirtualAccountsStore((state) => state.deleteVirtualAcccount);
    const hiddenIds = useRef<Set<number>>(new Set());
    // State per il modal di inserimento
    const [insertModalVisible, setInsertModalVisible] = useState(false);
    const [nome, setNome] = useState('');
    const [limite, setLimite] = useState('');
    const [aggiornamentoMensile, setAggiornamentoMensile] = useState(0);

    const visibleConti = contiVirtuali.filter(c =>
        c.id_conto_virtuale !== undefined &&
        !hiddenIds.current.has(c.id_conto_virtuale)
    );



    // STATE per tracciare quale elemento sta venendo eliminato (CAUSA RE-RENDER)
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Ref per le animazioni (NON causano re-render)
    const animationRefs = useRef<AnimationRefs>({
        values: {},
        swipeables: {}
    });

    // ---------------------------------------------------------------------------
    // FUNZIONI DI UTILITY
    // ---------------------------------------------------------------------------

    /**
     * Ottiene o crea un valore animato per un specifico ID
     */
    const getAnimationValue = (id: number): Animated.Value => {
        if (!animationRefs.current.values[id]) {
            animationRefs.current.values[id] = new Animated.Value(1);
        }
        return animationRefs.current.values[id];
    };

    /**
     * Calcola la percentuale di utilizzo del conto virtuale
     */
    const getUsagePercentage = (spese: number, limite: number): number => {
        if (limite === 0) return 0;
        return Math.min((spese / limite) * 100, 100);
    };

    // ---------------------------------------------------------------------------
    // GESTIONE INSERIMENTO
    // ---------------------------------------------------------------------------

    /**
     * Gestisce l'inserimento di un nuovo conto virtuale
     */
    const handleInsertNewVirtualAccount = (): void => {
        const limit = parseFloat(limite) || 0;

        if (limit === 0) {
            Alert.alert('Errore', 'Devi inserire un limite maggiore di 0');
            return;
        }

        const virtualAccount: VirtualAccount = {
            nome: nome,
            Totale_Spese: 0,
            Limite: limit,
            AggiornamentoMensile: aggiornamentoMensile
        };

        insertVirtualAccounts(virtualAccount);

        // Reset form
        setNome('');
        setLimite('');
        setAggiornamentoMensile(0);
        setInsertModalVisible(false);
    };

    // ---------------------------------------------------------------------------
    // GESTIONE ELIMINAZIONE
    // ---------------------------------------------------------------------------

    /**
     * Mostra l'alert di conferma eliminazione
     */
    const handleDeleteVirtualAccount = (id: number): void => {
        Alert.alert(
            'Elimina Conto Virtuale',
            'Sei sicuro di voler eliminare questo conto virtuale?',
            [
                {
                    text: 'Annulla',
                    style: 'cancel'
                },
                {
                    text: 'Elimina',
                    style: 'destructive',
                    onPress: () => startDeleteAnimation(id)
                }
            ]
        );
    };

    /**
     * Avvia l'animazione di eliminazione
     */
    const startDeleteAnimation = (id: number): void => {
        // Imposta l'ID in eliminazione (CAUSA RE-RENDER)
        setDeletingId(id);

        // Avvia l'animazione
        Animated.sequence([
            Animated.timing(getAnimationValue(id), {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start(() => {
            // Solo quando l'animazione è completata, cancella dallo store
            deleteVirtualAccount(id);

            //Aggiungiamo l'elemento nella lista degli elementi nascosti
            hiddenIds.current.add(id);
            // Pulizia
            setDeletingId(null);
            delete animationRefs.current.values[id];
        });
    };

    // ---------------------------------------------------------------------------
    // COMPONENTI DI RENDER
    // ---------------------------------------------------------------------------

    /**
     * Renderizza le azioni swipe (pulsante Elimina)
     */
    const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>, item: VirtualAccount) => {
        const scale = dragX.interpolate({
            inputRange: [-100, 0],
            outputRange: [1, 0],
            extrapolate: 'clamp',
        });

        const handleDeletePress = (): void => {
            // Chiudi lo swipeable prima di mostrare l'alert
            const itemId = item.id_conto_virtuale;
            if (itemId && animationRefs.current.swipeables[itemId]) {
                animationRefs.current.swipeables[itemId]?.close();
            }

            // Aspetta che lo swipeable si chiuda completamente
            setTimeout(() => {
                handleDeleteVirtualAccount(itemId!);
            }, 150);
        };

        return (
            <View style={styles.rightActions}>
                <Animated.View style={[styles.deleteButtonContainer, { transform: [{ scale }] }]}>
                    <Pressable
                        style={styles.deleteButton}
                        onPress={handleDeletePress}
                    >
                        <Text style={styles.deleteButtonText}>Elimina</Text>
                    </Pressable>
                </Animated.View>
            </View>
        );
    };

    /**
     * Renderizza una singola card di conto virtuale
     */
    const renderContoVirtuale = ({ item }: { item: VirtualAccount }) => {
        const spese = Number(item?.Totale_Spese) || 0;
        const limite = Number(item?.Limite) || 0;
        const usagePercentage = getUsagePercentage(spese, limite);
        const progressValue = usagePercentage / 100;
        const aggiornamento = item?.AggiornamentoMensile === 1;
        const isDeleting = deletingId === item.id_conto_virtuale;

        // Stili animati per l'eliminazione
        const animatedStyle = isDeleting ? {
            opacity: getAnimationValue(item.id_conto_virtuale!),
            transform: [
                {
                    translateX: getAnimationValue(item.id_conto_virtuale!).interpolate({
                        inputRange: [0, 1],
                        outputRange: [500, 0]
                    })
                },
                {
                    rotate: getAnimationValue(item.id_conto_virtuale!).interpolate({
                        inputRange: [0, 1],
                        outputRange: ['-15deg', '0deg']
                    })
                }
            ]
        } : {};

        return (
            <Animated.View style={animatedStyle}>
                <Swipeable
                    ref={ref => {
                        const itemId = item.id_conto_virtuale;
                        if (itemId) {
                            animationRefs.current.swipeables[itemId] = ref;
                        }
                    }}
                    renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
                    rightThreshold={40}
                    enabled={!isDeleting}
                >
                    <Pressable
                        style={({ pressed }) => [
                            styles.contoCard,
                            pressed && styles.cardPressed,
                        ]}
                        onPress={() => {
                            router.push({
                                pathname: '/VirtualAccountDetails',
                                params: { conto_id: item.id_conto_virtuale }
                            })
                        }}
                    >
                        {/* Header della card */}
                        <View style={styles.cardHeader}>
                            <Text style={styles.contoNome}>{item?.nome ?? 'Senza nome'}</Text>
                            {aggiornamento && <Text style={styles.badge}>Mensile</Text>}
                        </View>

                        {/* Importi */}
                        <View style={styles.importiContainer}>
                            <Text style={styles.importo}>Speso: € {spese.toFixed(2)}</Text>
                            <Text style={styles.limite}>Limite: € {limite.toFixed(2)}</Text>
                        </View>

                        {/* Barra di progresso */}
                        <ProgressBar
                            progress={progressValue}
                            style={styles.progressBar}
                            color={usagePercentage > 80 ? '#ff4444' : '#4CAF50'}
                        />

                        {/* Percentuale */}
                        <Text style={styles.percentage}>{usagePercentage.toFixed(1)}% utilizzato</Text>
                    </Pressable>
                </Swipeable>
            </Animated.View>
        );
    };

    // ---------------------------------------------------------------------------
    // RENDER PRINCIPALE
    // ---------------------------------------------------------------------------

    return (
        <View style={styles.container}>
            {/* Header con titolo e pulsante aggiungi */}
            <View style={styles.header}>
                <Text style={styles.title}>Conti Virtuali</Text>
                <IconButton
                    icon="plus-circle"
                    size={28}
                    iconColor="#1a237e"
                    onPress={() => { setInsertModalVisible(true) }}
                    style={styles.addButton}
                    accessibilityLabel="Aggiungi nuovo conto virtuale"
                />
            </View>



            {/* Lista conti virtuali */}
            {visibleConti.length === 0 ? (
                <Text style={styles.emptyText}>Nessun conto virtuale</Text>
            ) : (
                <FlatList
                    data={visibleConti}
                    renderItem={renderContoVirtuale}
                    keyExtractor={(item) => (item.id_conto_virtuale ?? 0).toString()}
                />
            )}

            {/* Modal per inserimento nuovo conto virtuale */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={insertModalVisible}
                onRequestClose={() => { setInsertModalVisible(false) }}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Nuovo Conto Virtuale</Text>

                        <TextInput
                            placeholder="Nome del conto"
                            style={styles.input}
                            value={nome}
                            onChangeText={setNome}
                            placeholderTextColor="#999"
                        />

                        <TextInput
                            placeholder="Limite (€)"
                            style={styles.input}
                            keyboardType="numeric"
                            value={limite}
                            onChangeText={setLimite}
                            placeholderTextColor="#999"
                        />

                        <View style={styles.checkboxContainer}>
                            <Checkbox.Android
                                status={aggiornamentoMensile === 1 ? 'checked' : 'unchecked'}
                                onPress={() => setAggiornamentoMensile(aggiornamentoMensile === 1 ? 0 : 1)}
                                color="#1a237e"
                            />
                            <Text style={styles.checkboxLabel}>Aggiornamento mensile</Text>
                        </View>

                        <View style={styles.modalButtons}>
                            <Pressable
                                style={[styles.btn, styles.cancelBtn]}
                                onPress={() => { setInsertModalVisible(false) }}
                            >
                                <Text style={styles.btnText}>Annulla</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.btn, styles.saveBtn]}
                                onPress={handleInsertNewVirtualAccount}
                            >
                                <Text style={styles.btnText}>Salva</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

// =============================================================================
// STILI
// =============================================================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a237e',
    },
    addButton: {
        margin: 0,
        backgroundColor: '#e8eaf6',
        borderRadius: 8,
    },
    contoCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardPressed: {
        backgroundColor: '#f5f5f5',
        transform: [{ scale: 0.98 }],
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    contoNome: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a237e',
    },
    badge: {
        backgroundColor: '#e3f2fd',
        color: '#1976d2',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        fontSize: 12,
        fontWeight: '500',
    },
    importiContainer: {
        marginBottom: 12,
    },
    importo: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    limite: {
        fontSize: 14,
        color: '#666',
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        marginBottom: 8,
        backgroundColor: '#f0f0f0',
    },
    percentage: {
        fontSize: 12,
        color: '#666',
        textAlign: 'right',
    },
    emptyText: {
        textAlign: 'center',
        color: '#666',
        marginTop: 40,
        fontSize: 16,
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1a237e',
        textAlign: 'center',
        marginBottom: 24,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 14,
        marginBottom: 16,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
        color: '#333',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        paddingHorizontal: 4,
    },
    checkboxLabel: {
        fontSize: 16,
        color: '#333',
        marginLeft: 8,
        fontWeight: '500',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    btn: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        minWidth: 80,
        alignItems: 'center',
    },
    cancelBtn: {
        backgroundColor: '#757575',
    },
    saveBtn: {
        backgroundColor: '#1a237e',
    },
    btnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    rightActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginBottom: 12,
    },
    deleteButtonContainer: {
        height: '100%',
        justifyContent: 'center',
    },
    deleteButton: {
        backgroundColor: '#ff4444',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '100%',
        borderRadius: 12,
    },
    deleteButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
});