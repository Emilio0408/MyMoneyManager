import { openDB } from "../database/db";
import { Spesa, VirtualAccount } from "./virtualAccountRepository";


export type Data_Sistema = {
    ID?: number,
    Mese: number,
    Anno: number
}

export type Report = {
    Mese: number,
    Anno: number,
    id_conto_virtuale: number,
    Limite: number,
    Nome: string,
    Totale_Spese: number
}



export const checkIfIsReportTime = async (): Promise<number> => {

    const db = await openDB();
    const row: Data_Sistema[] = await db.getAllAsync<Data_Sistema>('SELECT * FROM Data_Sistema WHERE ID = 1');

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();



    if (row[0].Anno < currentYear)
        return 1;
    else if (row[0].Anno === currentYear && row[0].Mese < currentMonth)
        return 1;
    else
        return 0;
}



export const updateDateSystem = async (month: number, year: number): Promise<void> => {
    const db = await openDB();
    await db.runAsync('UPDATE Data_Sistema SET Mese = ?, Anno = ? WHERE ID = 1', [month, year]);
}




export const createReports = async (VirtualAccounts: VirtualAccount[], Expenses: Spesa[]): Promise<number> => {

    const db = await openDB();
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    let month;
    let year;

    if (currentMonth === 1) {
        month = 12;
        year = currentYear - 1;
    }
    else {
        month = currentMonth - 1;
        year = currentYear;
    }




    try {
        // Avvia transazione : Usiamo una transazione per far si che o vengano inseriti tutti i report o non ne venga inserito nessuno, in modo da mantenere il DB consistente
        await db.execAsync("BEGIN TRANSACTION");

        for (const account of VirtualAccounts) {

            if (!account.id_conto_virtuale) {
                console.error("errore nella creazione del report");
                await db.execAsync("ROLLBACK");
                return 0;
            }

            await db.runAsync(`INSERT INTO Report  (Mese, Anno, id_conto_virtuale, Limite, Nome, Totale_Spese)  VALUES (?, ?, ?, ?, ?, ?)`, month, year,
                account.id_conto_virtuale,
                account.Limite,
                account.nome,
                account.Totale_Spese
            );
        }

        await db.execAsync("COMMIT");

        if (await createHistoricals(Expenses, month, year) === 1)
            return 1; //Se anche lo storico delle spese è stato creato correttamente, allora l'operazione andata a buon fine
        else {
            await db.execAsync("ROLLBACK");
            return 0;
        }
    } catch (error) {
        console.error("Errore durante la creazione del report:", error);
        await db.execAsync("ROLLBACK");
        return 0;
    }
}



export const getAllReportsOfVirtualAccount = async (id_conto_virtuale: number): Promise<Report[]> => {

    const db = await openDB();
    const reports: Report[] = await db.getAllAsync('SELECT * FROM Report WHERE id_conto_virtuale = ?', id_conto_virtuale);

    return reports;
}


export const getAllExpensesOfReport = async (month: number, year: number, id_conto_virtuale: number): Promise<Spesa[]> => {

    const db = await openDB();
    const Expenses: Spesa[] = await db.getAllAsync('SELECT * FROM Storico_Spese WHERE Mese = ? AND Anno = ? AND id_conto_virtuale = ?', [month, year, id_conto_virtuale]);

    return Expenses;
}





// Private utility function
const createHistoricals = async (Expenses: Spesa[], month: number, year: number,): Promise<number> => {

    const db = await openDB();


    try {
        for (const expense of Expenses) {

            if (!expense.id_spesa) {
                console.error("errore nella creazione del report");
                return 0;
            }

            await db.runAsync(`INSERT INTO Storico_Spese  (id_spesa, nome, nota, importo, id_conto_virtuale, Mese,Anno, data)  VALUES (?, ?, ?, ?, ?, ?, ?,?)`, expense.id_spesa, expense.nome,
                expense.nota, expense.importo, expense.id_conto_virtuale, month, year, expense.data
            );
        }
        return 1;

    } catch (error) {
        console.error("Errore durante la creazione dello storico:", error);
        return 0;
    }


}