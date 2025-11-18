import { getAllReportsOfVirtualAccount, Report } from "@/src/repositories/ReportRepository";
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { getMonthName } from "@/src/utils/utils";
import { IconButton } from "react-native-paper";

export default function ReportDetailsScreen() {
    const { conto_id } = useLocalSearchParams<{ conto_id: string }>();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const loadReports = async () => {
            try {
                const reportsData = await getAllReportsOfVirtualAccount(Number(conto_id));
                // Ordina i report per anno e mese (dal più recente al più vecchio)
                const sortedReports = reportsData.sort((a, b) => {
                    if (a.Anno !== b.Anno) {
                        return b.Anno - a.Anno; // Anno decrescente
                    }
                    return b.Mese - a.Mese; // Mese decrescente
                });
                setReports(sortedReports);
            } catch (error) {
                console.error("Errore nel caricamento dei report:", error);
            } finally {
                setLoading(false);
            }
        };

        loadReports();
    }, [conto_id]);



    // Calcola la percentuale di utilizzo
    const getUsagePercentage = (limite: number, totaleSpese: number): number => {
        if (limite <= 0) return 0;
        return Math.min((totaleSpese / limite) * 100, 100);
    };


    // Raggruppa i report per anno
    const groupReportsByYear = (reports: Report[]) => {
        const grouped: { [year: number]: Report[] } = {};
        reports.forEach(report => {
            if (!grouped[report.Anno]) {
                grouped[report.Anno] = [];
            }
            grouped[report.Anno].push(report);
        });
        return grouped;
    };

    const groupedReports = groupReportsByYear(reports);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Caricamento report...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>

            <View style={styles.header}>
                <IconButton icon="arrow-left" onPress={() => router.back()} />
                <Text style={styles.title}>Report conto</Text>
            </View>


            <ScrollView showsVerticalScrollIndicator={false}>
                {Object.keys(groupedReports).length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Nessun report disponibile</Text>
                    </View>
                ) : (
                    Object.entries(groupedReports)
                        .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA)) // Ordina anni decrescenti
                        .map(([year, yearReports]) => (
                            <View key={year} style={styles.yearSection}>
                                <Text style={styles.yearTitle}>{year}</Text>
                                {yearReports.map((report, index) => {
                                    const usagePercentage = getUsagePercentage(report.Limite, report.Totale_Spese);
                                    return (
                                        <TouchableOpacity
                                            key={`${report.Mese}-${report.Anno}-${index}`}
                                            style={styles.reportCard}
                                            onPress={() => {
                                                router.push({
                                                    pathname: '/HistoricDetails',
                                                    params: { month: report.Mese, year: report.Anno, id_conto_virtuale: report.id_conto_virtuale, Spesa_Totale: report.Totale_Spese, limite: report.Limite }
                                                })
                                            }}
                                        >
                                            <View style={styles.cardHeader}>
                                                <Text style={styles.monthTitle}>
                                                    {getMonthName(report.Mese)}
                                                </Text>
                                                <Text style={styles.accountName}>
                                                    {report.Nome}
                                                </Text>
                                            </View>

                                            <View style={styles.progressContainer}>
                                                <View style={styles.progressLabels}>
                                                    <Text style={styles.progressText}>
                                                        Speso: €{report.Totale_Spese.toFixed(2)}
                                                    </Text>
                                                    <Text style={styles.progressText}>
                                                        Limite: €{report.Limite.toFixed(2)}
                                                    </Text>
                                                </View>

                                                <View style={styles.progressBarBackground}>
                                                    <View
                                                        style={[
                                                            styles.progressBarFill,
                                                            {
                                                                width: `${usagePercentage}%`,
                                                                backgroundColor: usagePercentage > 80 ? '#FF3B30' :
                                                                    usagePercentage > 60 ? '#FF9500' : '#34C759'
                                                            }
                                                        ]}
                                                    />
                                                </View>

                                                <Text style={styles.percentageText}>
                                                    {usagePercentage.toFixed(1)}% utilizzato
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        ))
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 40,
        backgroundColor: '#f5f5f7',
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        color: '#999',
        textAlign: 'center',
    },
    yearSection: {
        marginBottom: 24,
    },
    yearTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1a237e',
        marginBottom: 20,
        paddingHorizontal: 8,
        letterSpacing: 1,
    },
    reportCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#1a237e',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
        borderLeftWidth: 4,
        borderLeftColor: '#1a237e',
    },
    cardHeader: {
        marginBottom: 12,
    },
    monthTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1a237e',
        marginBottom: 6,
        letterSpacing: 0.5,
    },
    accountName: {
        fontSize: 15,
        color: '#757575',
        fontWeight: '600',
        fontStyle: 'italic',
    },
    progressContainer: {
        marginTop: 8,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressText: {
        fontSize: 14,
        color: '#757575',
        fontWeight: '600',
    },
    progressBarBackground: {
        height: 10,
        backgroundColor: '#e0e0e0',
        borderRadius: 5,
        overflow: 'hidden',
        marginBottom: 10,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 5,
        backgroundColor: '#1a237e', // Colore principale per la progress bar
    },
    percentageText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1a237e',
        textAlign: 'right',
    },
});