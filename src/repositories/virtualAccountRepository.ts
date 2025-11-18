import { openDB } from "../database/db";


export type VirtualAccount = {
    id_conto_virtuale?: number; //Opzionale
    nome: string;
    Totale_Spese: number; //Opzionale
    Limite: number;
    AggiornamentoMensile: number;
}


export type Spesa = {
    id_spesa?: number;
    nome: string;
    nota: string;
    importo: number;
    id_conto_virtuale: number;
    data: string
}





export const getAllVirtualAccount = async () => {
    const db = await openDB();
    const rows = await db.getAllAsync<VirtualAccount>('SELECT * FROM Conto_Virtuale');

    if (rows.length === 0) {
        return [];
    }


    return rows;
}


export const insertVirtualAccount = async (virtualAccount: VirtualAccount): Promise<number> => {
    const db = await openDB();
    const result = await db.runAsync('INSERT INTO Conto_Virtuale (nome, Limite , aggiornamentoMensile) VALUES (?,?,?)', [virtualAccount.nome, virtualAccount.Limite, virtualAccount.AggiornamentoMensile])
    const id_new_virtualAccount = result.lastInsertRowId as number;


    return id_new_virtualAccount;
}


export const deleteVirtualAcccount = async (id_conto_virtuale: number): Promise<void> => {
    const db = await openDB();
    await db.runAsync('DELETE FROM Conto_Virtuale WHERE id_conto_virtuale = ?', [id_conto_virtuale]);
}


export const getVirtualAccount = async (id_conto_virtuale: number): Promise<VirtualAccount | null> => {

    const db = await openDB();
    const rows = await db.getAllAsync('SELECT * FROM Conto_Virtuale WHERE id_conto_virtuale = ?', [id_conto_virtuale]);

    if (rows.length === 0) {
        console.error("ID del conto virtuale non presente nel database");
        return null;
    }


    return rows[0] as VirtualAccount;

}


export const updateVirtualAccountLimit = async (id_conto_virtuale: number, new_limit: number): Promise<void> => {

    const db = await openDB();
    await db.runAsync('UPDATE Conto_Virtuale  SET Limite = ? WHERE id_conto_virtuale = ?', [new_limit, id_conto_virtuale]);
}

export const updateVirtualAccountName = async (id_conto_virtuale: number, new_name: string): Promise<void> => {
    const db = await openDB();
    await db.runAsync('UPDATE Conto_Virtuale  SET nome = ? WHERE id_conto_virtuale = ?', [new_name, id_conto_virtuale]);
}


export const updateVirtualAccountTotaleSpese = async (id_conto_virtuale: number, new_totale_speso: number): Promise<void> => {

    const db = await openDB();
    await db.runAsync('UPDATE Conto_Virtuale SET Totale_Spese = ? WHERE id_conto_virtuale = ?', [new_totale_speso, id_conto_virtuale]);

}


export const getAllExpensesOfVirtualAccount = async (id_conto_virtuale: number): Promise<Spesa[]> => {

    const db = await openDB();
    const rows: Spesa[] = await db.getAllAsync('SELECT * FROM Spesa WHERE id_conto_virtuale = ?', [id_conto_virtuale]);


    if (rows.length === 0)
        return []

    return rows;

}

export const insertExpenseInVirtualAccount = async (expense: Spesa): Promise<number> => {
    const db = await openDB();
    const result = await db.runAsync('INSERT INTO Spesa (nome,nota,importo,id_conto_virtuale,data) VALUES (?,?,?,?,?)',
        [expense.nome, expense.nota, expense.importo, expense.id_conto_virtuale, expense.data]);
    const newExpenseID = result.lastInsertRowId as number;


    return newExpenseID;
}

export const deleteExpenseInVirtualAccount = async (id_spesa: number): Promise<void> => {
    const db = await openDB();
    await db.runAsync('DELETE FROM Spesa WHERE id_spesa = ?', [id_spesa]);
}


export const getExpense = async (id_spesa: number): Promise<Spesa | null> => {
    const db = await openDB();
    const row = await db.getAllAsync('SELECT * FROM Spesa WHERE id_spesa = ?', [id_spesa]);

    if (row.length === 0) {
        console.error("ID della spesa non presente nel database");
        return null;
    }


    return row[0] as Spesa;
}


export const getAllMonthlyRefreshVirtualAccount = async (): Promise<VirtualAccount[]> => {

    const db = await openDB();
    const rows: VirtualAccount[] = await db.getAllAsync<VirtualAccount>('SELECT * FROM Conto_Virtuale WHERE AggiornamentoMensile = 1');
    return rows;
}

export const resetVirtualAccounts = async (virtualAccountsID: number[]): Promise<number> => {

    const db = await openDB();


    try {

        await db.execAsync("BEGIN TRANSACTION");

        for (const accountID of virtualAccountsID) {
            await db.runAsync('UPDATE Conto_Virtuale SET Totale_Spese = 0 WHERE id_conto_virtuale = ?', accountID);
            await db.runAsync('DELETE FROM Spesa WHERE id_conto_virtuale = ?', accountID);
        }

        await db.execAsync("COMMIT");
        return 1;

    } catch (error) {
        console.error("Errore durante il reset dei conti virtuali:", error);
        await db.execAsync("ROLLBACK");
        return 0;
    }



}
