import { Spesa } from '@/src/repositories/virtualAccountRepository';
import { useManageVirtualAccountStore } from '@/src/stores/useManageVirtualAccountStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Keyboard, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { IconButton, ProgressBar } from 'react-native-paper';

export default function VirtualAccountDetailsScreen() {

    //ID passato dal tab
    const { conto_id } = useLocalSearchParams<{ conto_id: string }>();

    //Recupero delle funzionalità dallo store
    const loadVirtualAccountDetails = useManageVirtualAccountStore((state) => state.loadVirtualAccountDetails);
    const updateNomeConto = useManageVirtualAccountStore((state) => state.updateNomeConto);
    const updateLimiteConto = useManageVirtualAccountStore((state) => state.updateLimiteConto);
    const insertNewExpense = useManageVirtualAccountStore((state) => state.insertExpense)
    const deleteExpense = useManageVirtualAccountStore((state) => state.deleteExpense)

    //Recuper dei dati dallo store
    const NomeConto = useManageVirtualAccountStore((state) => state.NomeConto);
    const LimiteConto = useManageVirtualAccountStore((state) => state.LimiteConto);
    const TotaleSpese = useManageVirtualAccountStore((state) => state.TotaleSpese);
    const spese = useManageVirtualAccountStore((state) => state.expenses);
    const AggiornamentoMensile = useManageVirtualAccountStore((state) => state.AggiornamentoMensile);

    //Hook per gli stati e i dati necessari al modal di inserimento
    const [insertModalVisible, setInsertModalVisible] = useState(false);
    const [nomeSpesa, setNomeSpesa] = useState('');
    const [importoSpesa, setImportoSpesa] = useState('');
    const [notaSpesa, setNotaSpesa] = useState('');


    //Hook per gli stati e i dati necessari al modal di aggiornamento dettagli del conto
    const [modificaModalVisible, setModificaModalVisible] = useState(false);
    const [nuovoNome, setNuovoNome] = useState('');
    const [nuovoLimite, setNuovoLimite] = useState('');

    //Router per navigare verso lo storico del conto
    const router = useRouter();

    useEffect(() => {
        loadVirtualAccountDetails(Number(conto_id));
    }, [conto_id]);

    // Calcola la percentuale di utilizzo
    const percentualeUtilizzo = LimiteConto > 0 ? (TotaleSpese / LimiteConto) * 100 : 0;
    const progressValue = percentualeUtilizzo / 100; //Valore da passare alla progress bar per visualizzare la linea di riempimento dei progressi

    // Determina il colore in base alla percentuale
    const getProgressColor = () => {
        if (percentualeUtilizzo >= 90) return '#ff4444'; // Rosso se >90%
        if (percentualeUtilizzo >= 70) return '#ff9800'; // Arancione se >70%
        return '#4CAF50'; // Verde se sotto
    };



    // Aggiungi questa funzione per gestire il salvataggio
    const handleSalvaSpesa = () => {
        if (!nomeSpesa.trim()) {
            alert('Il nome della spesa è obbligatorio');
            return;
        }

        if (!importoSpesa.trim() || parseFloat(importoSpesa) <= 0) {
            alert('Inserisci un importo valido maggiore di 0');
            return;
        }



        const spesa: Spesa = {
            nome: nomeSpesa.trim(),
            nota: notaSpesa.trim(),
            importo: parseFloat(importoSpesa.replace(',', '.')) || 0,
            data: new Date().toLocaleDateString('it-IT'),
            id_conto_virtuale: Number(conto_id)
        };


        insertNewExpense(spesa);


        // Reset form e chiudi modal
        setNomeSpesa('');
        setImportoSpesa('');
        setNotaSpesa('');
        setInsertModalVisible(false);
    };

    const handleSalvaModifiche = () => {
        if (!nuovoNome.trim() && !nuovoLimite.trim()) {
            alert('Inserisci almeno il nome o il limite del conto');
            return;
        }

        // Qui chiamerai la funzione del store per aggiornare il conto
        if (nuovoNome.trim() && nuovoLimite.trim()) {
            updateNomeConto(Number(conto_id), nuovoNome);
            updateLimiteConto(Number(conto_id), Number(nuovoLimite));
        }
        else if (nuovoNome.trim() && !nuovoLimite.trim()) {
            updateNomeConto(Number(conto_id), nuovoNome);
        }
        else {
            updateLimiteConto(Number(conto_id), Number(nuovoLimite));
        }




        // Reset e chiudi modal
        setNuovoNome('');
        setNuovoLimite('');
        setModificaModalVisible(false);
    };

    const handleDeleteSpesa = (id_spesa: number) => {
        Alert.alert(
            "Elimina Spesa",
            "Sei sicuro di voler eliminare questa spesa?",
            [
                {
                    text: "Annulla",
                    style: "cancel"
                },
                {
                    text: "Elimina",
                    style: "destructive",
                    onPress: () => {
                        // Qui chiamerai la funzione del store per eliminare la spesa
                        deleteExpense(id_spesa);
                    }
                }
            ]
        );
    };


    const handleVisualizzaStorico = () => {

        router.push({
            pathname: '/ReportDetails',
            params: { conto_id: conto_id }
        })

    };

    const renderSpesa = ({ item }: { item: Spesa }) => (
        <View style={styles.spesaItem}>
            <View style={styles.spesaInfo}>
                <Text style={styles.spesaNome}>{item.nome}</Text>
                {item.nota && <Text style={styles.spesaNota}>{item.nota}</Text>}
                <Text style={styles.spesaData}>{item.data}</Text>
            </View>

            <View style={styles.spesaActions}>
                <Text style={styles.spesaImporto}>€ {item.importo.toFixed(2)}</Text>
                <IconButton
                    icon="delete"
                    iconColor="#ff4444"
                    size={20}
                    onPress={() => handleDeleteSpesa(item.id_spesa || 0)}
                    style={styles.deleteButton}
                />
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <IconButton icon="arrow-left" onPress={() => router.back()} />
                <Text style={styles.title}>Gestione Conto</Text>
            </View>

            {/* Nome del conto */}
            <View style={styles.contoHeader}>
                <Text style={styles.nomeConto}>
                    {NomeConto || 'Conto Virtuale'}
                </Text>

                {/* Barra di progresso e informazioni */}
                <View style={styles.progressContainer}>
                    <View style={styles.importiContainer}>
                        <Text style={styles.importoSpeso}>Speso: € {TotaleSpese?.toFixed(2) || '0.00'}</Text>
                        <Text style={styles.limiteConto}>Limite: € {LimiteConto?.toFixed(2) || '0.00'}</Text>
                    </View>

                    <ProgressBar
                        progress={progressValue}
                        color={getProgressColor()}
                        style={styles.progressBar}
                    />

                    <View style={styles.percentualeContainer}>
                        <Text style={[
                            styles.percentualeText,
                            { color: getProgressColor() }
                        ]}>
                            {percentualeUtilizzo.toFixed(1)}% utilizzato
                        </Text>
                        <Text style={styles.rimanenteText}>
                            Rimanente: € {(LimiteConto - TotaleSpese)?.toFixed(2) || '0.00'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Pulsanti di azione */}
            <View style={[
                styles.azioniContainer,
                AggiornamentoMensile !== 1 && styles.azioniContainerNoStorico
            ]}>

                {AggiornamentoMensile === 1 && (
                    <Pressable
                        style={({ pressed }) => [
                            styles.azioneBtn,
                            pressed && styles.azioneBtnPressed
                        ]}
                        onPress={handleVisualizzaStorico}>
                        <Text style={styles.azioneTesto}>📊 Visualizza Storico</Text>
                    </Pressable>
                )}

                <Pressable
                    style={({ pressed }) => [
                        styles.azioneBtn,
                        pressed && styles.azioneBtnPressed
                    ]}
                    onPress={() => { setModificaModalVisible(true) }}>
                    <Text style={styles.azioneTesto}>⚙️ Modifica dettagli conto</Text>
                </Pressable>

                <Pressable
                    style={({ pressed }) => [
                        styles.azioneBtn,
                        pressed && styles.azioneBtnPressed
                    ]}
                    onPress={() => { setInsertModalVisible(true) }}>
                    <Text style={styles.azioneTesto}>➕ Aggiungi Spesa</Text>
                </Pressable>
            </View>

            {/* Lista spese recenti */}
            <View style={styles.listaContainer}>
                <Text style={styles.listaTitolo}>Spese Recenti</Text>
                {spese.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Nessuna spesa inserita</Text>
                    </View>
                ) : (
                    <FlatList
                        data={spese}
                        renderItem={renderSpesa}
                        keyExtractor={item => item.id_spesa ? item.id_spesa.toString() : ''}
                        style={styles.lista}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>






            {/* Modal inserimento spesa */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={insertModalVisible}
                onRequestClose={() => { setInsertModalVisible(false) }}
                onDismiss={() => { setInsertModalVisible(false) }}
            >
                <Pressable style={styles.modalBackground} onPress={() => { Keyboard.dismiss() }} >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Nuova Spesa</Text>

                        {/* Nome Spesa */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Nome Spesa *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Inserisci il nome della spesa"
                                value={nomeSpesa}
                                onChangeText={setNomeSpesa}
                                placeholderTextColor="#999"
                            />
                        </View>

                        {/* Importo */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Importo (€) *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0.00"
                                keyboardType="decimal-pad"
                                value={importoSpesa}
                                onChangeText={setImportoSpesa}
                                placeholderTextColor="#999"
                            />
                        </View>

                        {/* Nota */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Nota (opzionale)</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Aggiungi una nota..."
                                value={notaSpesa}
                                onChangeText={setNotaSpesa}
                                placeholderTextColor="#999"
                                multiline={true}
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </View>

                        <Text style={styles.requiredHint}>* Campi obbligatori</Text>

                        {/* Pulsanti */}
                        <View style={styles.modalButtons}>
                            <Pressable
                                style={[styles.modalBtn, styles.cancelBtn]}
                                onPress={() => {
                                    setInsertModalVisible(false);
                                    setNomeSpesa('');
                                    setImportoSpesa('');
                                    setNotaSpesa('');
                                }}
                            >
                                <Text style={styles.modalBtnText}>Annulla</Text>
                            </Pressable>

                            <Pressable
                                style={[styles.modalBtn, styles.saveBtn]}
                                onPress={handleSalvaSpesa}
                            >
                                <Text style={styles.modalBtnText}>Salva Spesa</Text>
                            </Pressable>
                        </View>
                    </View>
                </Pressable>
            </Modal>

            {/* Modal modifica dettagli conto */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modificaModalVisible}
                onRequestClose={() => { setModificaModalVisible(false) }}
                onDismiss={() => setModificaModalVisible(false)}
            >
                <Pressable style={styles.modalBackground} onPress={() => Keyboard.dismiss()}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Modifica Conto</Text>

                        {/* Nome Conto */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Nome Conto</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={NomeConto || "Inserisci nuovo nome"}
                                value={nuovoNome}
                                onChangeText={setNuovoNome}
                                placeholderTextColor="#999"
                            />
                        </View>

                        {/* Limite */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Limite (€)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={LimiteConto?.toString() || "Inserisci nuovo limite"}
                                keyboardType="decimal-pad"
                                value={nuovoLimite}
                                onChangeText={setNuovoLimite}
                                placeholderTextColor="#999"
                            />
                        </View>

                        <Text style={styles.requiredHint}>Inserisci almeno il nome o il limite</Text>

                        {/* Pulsanti */}
                        <View style={styles.modalButtons}>
                            <Pressable
                                style={[styles.modalBtn, styles.cancelBtn]}
                                onPress={() => {
                                    setModificaModalVisible(false);
                                    setNuovoNome('');
                                    setNuovoLimite('');
                                }}
                            >
                                <Text style={styles.modalBtnText}>Annulla</Text>
                            </Pressable>

                            <Pressable
                                style={[styles.modalBtn, styles.saveBtn, { height: 50 }]}
                                onPress={handleSalvaModifiche}
                            >
                                <Text style={styles.modalBtnText}>Salva</Text>
                            </Pressable>
                        </View>
                    </View>
                </Pressable>
            </Modal>

        </View>




    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        paddingTop: 40,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a237e',
        marginLeft: 8,
    },
    contoHeader: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    nomeConto: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a237e',
        marginBottom: 16,
    },
    progressContainer: {
        marginTop: 8,
    },
    importiContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    importoSpeso: {
        fontSize: 16,
        fontWeight: '600',
        color: '#e53935',
    },
    limiteConto: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a237e',
    },
    progressBar: {
        height: 10,
        borderRadius: 5,
        backgroundColor: '#f0f0f0',
        marginBottom: 8,
    },
    percentualeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    percentualeText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    rimanenteText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    azioniContainer: {
        flexDirection: 'column',
        marginBottom: 20,
        gap: 12,
        minHeight: 180
    },
    azioniContainerNoStorico: {
        flexDirection: 'column',
        marginBottom: 20,
        gap: 12,
        minHeight: 140
    },
    azioneBtn: {
        flex: 1,
        backgroundColor: '#1a237e',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 2,
    },
    azioneBtnPressed: {
        backgroundColor: '#0d1a66',
        transform: [{ scale: 0.98 }],
        elevation: 1,
    },
    azioneTesto: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center'
    },
    listaContainer: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    listaTitolo: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a237e',
        marginBottom: 16,
    },
    lista: {
        flex: 1,
    },
    spesaItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    spesaInfo: {
        flex: 1,
    },
    spesaNome: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 4,
    },
    spesaNota: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
    },
    spesaActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    deleteButton: {
        margin: 0,
        backgroundColor: '#ffebee',
        borderRadius: 6,
    },
    spesaImporto: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#e53935',
    },
    spesaData: {
        fontSize: 12,
        color: '#666',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
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
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 14,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
        color: '#333',
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    requiredHint: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    modalBtn: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        elevation: 2,
    },
    cancelBtn: {
        backgroundColor: '#757575',
    },
    saveBtn: {
        backgroundColor: '#1a237e',
    },
    modalBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center'
    },
});