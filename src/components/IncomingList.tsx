// src/components/IncomingList.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useMainAccountStore } from '../stores/useMainAccountStore';

const IncomingList = () => {
    const entrate = useMainAccountStore((state) => state.IncomingData);
    const addEntrate = useMainAccountStore((state) => state.addIncoming);
    const deleteEntrate = useMainAccountStore((state) => state.deleteIncoming);
    const entrataDaEliminareRef = useRef<number | null>(null);

    const [InsertModalVisible, setInsertModalVisible] = useState(false);
    const [DeleteModalVisible, setDeleteModalVisible] = useState(false);
    const [nome, setNome] = useState('');
    const [nota, setNota] = useState('');
    const [importo, setImporto] = useState('');
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

    const insertNewEntrata = () => {
        addEntrate(nome, nota, parseFloat(importo.replace(',', '.')));
        setInsertModalVisible(false);
        // Reset dei campi
        setNome('');
        setNota('');
        setImporto('');
    }

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity: fadeAnim,
                    transform: [
                        { translateY: slideAnim },
                        { scale: scaleAnim }
                    ],
                }
            ]}
        >
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.title}>Le tue entrate</Text>
                <IconButton
                    icon="plus"
                    size={32}
                    onPress={() => setInsertModalVisible(true)}
                    accessibilityLabel="Aggiungi nuova entrata"
                    iconColor='#3498db'
                    style={{ position: 'relative', right: 15, bottom: 10 }}
                />
            </View>

            <View style={styles.listContainer}>
                {entrate.length === 0 ? (
                    <Text style={styles.info}>Nessuna entrata registrata</Text>
                ) : (
                    <FlatList
                        data={entrate}
                        keyExtractor={(item) => item.id_entrata.toString()}
                        renderItem={({ item }) => (
                            <Animated.View
                                style={[
                                    styles.item,
                                    {
                                        opacity: fadeAnim,
                                        transform: [
                                            { translateY: slideAnim }
                                        ],
                                    }
                                ]}
                            >
                                <View style={styles.itemContent}>
                                    <View style={styles.itemText}>
                                        <Text style={styles.nome}>{item.nome}</Text>
                                        {item.nota ? <Text style={styles.nota}>{item.nota}</Text> : null}
                                        <Text style={styles.importo}>+ € {item.importo.toFixed(2)}</Text>
                                    </View>
                                    <IconButton
                                        icon="delete"
                                        size={24}
                                        onPress={() => {
                                            entrataDaEliminareRef.current = item.id_entrata;
                                            setDeleteModalVisible(true);
                                        }}
                                        iconColor="#e57373" // rosso chiaro
                                        style={styles.deleteButton}
                                        accessibilityLabel={`Elimina entrata ${item.nome}`}
                                    />
                                </View>
                            </Animated.View>
                        )}
                    />
                )}
            </View>

            {/* Modal per inserimento nuova entrata */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={InsertModalVisible}
                onRequestClose={() => setInsertModalVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <Animated.View
                        style={[
                            styles.modalContent,
                            {
                                opacity: fadeAnim,
                                transform: [
                                    { translateY: slideAnim }
                                ],
                            }
                        ]}
                    >
                        <Text style={styles.modalTitle}>Nuova Entrata</Text>

                        <TextInput
                            placeholder="Nome"
                            style={styles.input}
                            value={nome}
                            onChangeText={setNome}
                        />
                        <TextInput
                            placeholder="Nota (opzionale)"
                            style={styles.input}
                            value={nota}
                            onChangeText={setNota}
                        />
                        <TextInput
                            placeholder="Importo"
                            style={styles.input}
                            keyboardType="numeric"
                            value={importo}
                            onChangeText={setImporto}
                        />

                        <View style={styles.modalButtons}>
                            <Pressable
                                style={[styles.btn, styles.cancel]}
                                onPress={() => {
                                    setInsertModalVisible(false);
                                    setNome('');
                                    setNota('');
                                    setImporto('');
                                }}
                            >
                                <Text style={styles.btnText}>Annulla</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.btn, styles.confirm]}
                                onPress={insertNewEntrata}
                            >
                                <Text style={styles.btnText}>Salva</Text>
                            </Pressable>
                        </View>
                    </Animated.View>
                </View>
            </Modal>

            {/*Modal per conferma cancellazione*/}
            <Modal
                animationType="fade"
                transparent={true}
                visible={DeleteModalVisible}
                onRequestClose={() => {
                    setDeleteModalVisible(false);
                    entrataDaEliminareRef.current = null;
                }}
            >

                <View style={styles.modalBackground}>

                    <Animated.View
                        style={[
                            styles.modalContent,
                            {
                                opacity: fadeAnim,
                                transform: [
                                    { translateY: slideAnim }
                                ],
                            }
                        ]}
                    >

                        <Text style={styles.modalTitle}>Elimina Entrata</Text>
                        <Text style={styles.confirmText}> 🗑️ Eliminare quest'entrata? </Text>

                        <View style={styles.deleteModalButtons}>

                            <Pressable
                                style={[styles.btn, styles.delete]}
                                onPress={() => {
                                    if (entrataDaEliminareRef.current) {
                                        deleteEntrate(entrataDaEliminareRef.current);
                                        setDeleteModalVisible(false);
                                        entrataDaEliminareRef.current = null;
                                    }
                                }}
                            >
                                <Text style={styles.btnText}>Conferma</Text>
                            </Pressable>

                            <Pressable
                                style={[styles.btn, styles.cancel]}
                                onPress={() => {
                                    setDeleteModalVisible(false);
                                    entrataDaEliminareRef.current = null;
                                }}
                            >
                                <Text style={styles.btnText}>Annulla</Text>
                            </Pressable>



                        </View>
                    </Animated.View>
                </View>

            </Modal>


        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        padding: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 10,
        marginBottom: 10,
        color: '#1a237e',
    },
    item: {
        backgroundColor: '#fff',
        padding: 16,
        marginVertical: 6,
        marginHorizontal: 10,
        borderRadius: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    listContainer: {
        height: 400,
        marginBottom: 20,
    },
    nome: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a237e',
    },
    nota: {
        color: '#666',
        marginTop: 4,
        fontSize: 14,
    },
    importo: {
        color: '#2e7d32',
        fontWeight: '700',
        marginTop: 4,
        fontSize: 16,
    },
    info: {
        textAlign: 'center',
        marginTop: 20,
        color: '#555',
        fontSize: 16,
    },
    addButton: {
        backgroundColor: '#1976d2',
        padding: 14,
        borderRadius: 8,
        margin: 20,
        alignItems: 'center',
    },
    addButtonText: { color: '#fff', fontWeight: 'bold' },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalContent: {
        backgroundColor: '#fff',
        marginHorizontal: 30,
        borderRadius: 12,
        padding: 20,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#1a237e',
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 20,
        gap: 12,
    },
    btn: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    cancel: {
        backgroundColor: '#757575',
    },
    confirm: {
        backgroundColor: '#1a237e',
    },
    btnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },

    itemContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemText: {
        flex: 1,
    },
    deleteButton: {
        margin: 0,
        marginLeft: 10,
    },
    confirmText: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 22,
    },
    delete: {
        backgroundColor: '#1a237e', // Rosso per eliminazione
    },

    deleteModalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        padding: 15
    },
});

export default IncomingList;