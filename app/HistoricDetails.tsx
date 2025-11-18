import { getAllExpensesOfReport } from "@/src/repositories/ReportRepository";
import { Spesa } from "@/src/repositories/virtualAccountRepository";
import { formatCurrency, getMonthName } from "@/src/utils/utils";
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { IconButton } from "react-native-paper";

export default function HistoricDetails() {

    const [Expenses, setExpenses] = useState<Spesa[]>([]);
    const { month } = useLocalSearchParams<{ month: string }>();
    const { year } = useLocalSearchParams<{ year: string }>();
    const { id_conto_virtuale } = useLocalSearchParams<{ id_conto_virtuale: string }>();
    const { Spesa_Totale, limite } = useLocalSearchParams<{ Spesa_Totale: string, limite: string }>();
    const router = useRouter();

    useEffect(() => {
        const loadReports = async () => {
            try {
                const ExpensesData = await getAllExpensesOfReport(Number(month), Number(year), Number(id_conto_virtuale));
                setExpenses(ExpensesData);
            } catch (error) {
                console.error("Errore nel caricamento dei report:", error);
            }
        };

        loadReports();
    }, [month, year, id_conto_virtuale]);



    const percentualeUtilizzo = Math.min((Number(Spesa_Totale) / Number(limite)) * 100, 100);

    return (
        <View style={styles.container}>


            <View style={styles.header}>
                <IconButton icon="arrow-left" onPress={() => router.back()} />
                <Text style={styles.title}>
                    Spese {getMonthName(Number(month))} {year}
                </Text>
            </View>



            {/* Barra di progresso */}
            <View style={styles.progressContainer}>
                <View style={styles.progressLabels}>
                    <Text style={styles.progressText}>Utilizzo budget</Text>
                    <Text style={styles.progressText}>
                        {formatCurrency(Number(Spesa_Totale))} / {formatCurrency(Number(limite))}
                    </Text>
                </View>
                <View style={styles.progressBarBackground}>
                    <View
                        style={[
                            styles.progressBarFill,
                            { width: `${percentualeUtilizzo}%` }
                        ]}
                    />
                </View>
                <Text style={styles.percentageText}>
                    {percentualeUtilizzo.toFixed(1)}%
                </Text>
            </View>

            <ScrollView style={styles.tableContainer}>
                {/* Intestazione della tabella */}
                <View style={styles.tableHeader}>
                    <Text style={[styles.headerCell, styles.cellNome]}>Nome</Text>
                    <Text style={[styles.headerCell, styles.cellDescrizione]}>Descrizione</Text>
                    <Text style={[styles.headerCell, styles.cellImporto]}>Importo</Text>
                    <Text style={[styles.headerCell, styles.cellData]}>Data</Text>
                </View>

                {/* Righe delle spese */}
                {Expenses.length > 0 ? (
                    Expenses.map((spesa, index) => (
                        <View
                            key={spesa.id_spesa || index}
                            style={[
                                styles.tableRow,
                                index % 2 === 0 ? styles.rowEven : styles.rowOdd
                            ]}
                        >
                            <Text style={[styles.cell, styles.cellNome, styles.nomeText]}>
                                {spesa.nome}
                            </Text>
                            <Text style={[styles.cell, styles.cellDescrizione, styles.descrizioneText]}>
                                {spesa.nota || "-"}
                            </Text>
                            <Text style={[styles.cell, styles.cellImporto, styles.importoText]}>
                                {formatCurrency(spesa.importo)}
                            </Text>
                            <Text style={[styles.cell, styles.cellData, styles.dataText]}>
                                {spesa.data}
                            </Text>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>Nessuna spesa trovata</Text>
                    </View>
                )}

                {/* Riga del totale */}
                {Expenses.length > 0 && (
                    <View style={styles.totaleRow}>
                        <Text style={styles.totaleLabel}>TOTALE: </Text>
                        <Text style={styles.totaleImporto}>{formatCurrency(Number(Spesa_Totale))}</Text>
                        <Text style={styles.totaleSpacer}></Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 45,
        backgroundColor: '#f5f5f5',
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
    progressContainer: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a237e',
    },
    progressBarBackground: {
        height: 12,
        backgroundColor: '#e0e0e0',
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#1a237e',
        borderRadius: 6,
    },
    percentageText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#757575',
        textAlign: 'center',
    },
    tableContainer: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#1a237e',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 12,
    },
    headerCell: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        alignItems: 'center',
    },
    rowEven: {
        backgroundColor: '#fafafa',
    },
    rowOdd: {
        backgroundColor: 'white',
    },
    cell: {
        justifyContent: 'center',
    },
    cellNome: {
        flex: 2.7,
        marginRight: 20,
    },
    cellDescrizione: {
        flex: 3,  // Ridotto da 3 a 2
        marginRight: 6,
    },
    cellImporto: {
        flex: 2,  // Aumentato da 1 a 2
        marginRight: 6,
        alignItems: 'flex-end',
    },
    cellData: {
        flex: 2.2,  // Mantenuto 1
        alignItems: 'center',
    },

    nomeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a237e',
    },
    descrizioneText: {
        fontSize: 13,
        color: '#757575',
        fontStyle: 'italic',
    },
    importoText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#d32f2f',
    },
    dataText: {
        fontSize: 12,
        color: '#757575',
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#757575',
        textAlign: 'center',
    },
    totaleRow: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderTopWidth: 2,
        borderTopColor: '#1a237e'
    },
    totaleLabel: {
        flex: 2,  // Nome
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a237e',
    },
    totaleImporto: {
        flex: 2,  // Importo - aumentato da 1 a 2
        fontSize: 16,
        fontWeight: 'bold',
        color: '#d32f2f',
    },
    totaleSpacer: {
        flex: 3,  // Descrizione + Data
    },
});