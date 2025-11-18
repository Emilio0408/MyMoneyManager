export const formatCurrency = (value: number) => {
    try {
        return value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
    } catch {
        return `${value.toFixed(2)} €`;
    }
};

export const getMonthName = (month: number): string => {
    const months = [
        'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
        'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
    ];
    return months[month - 1] || 'Mese non valido';
};