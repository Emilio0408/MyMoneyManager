// src/repositories/mainAccountRepository.ts
import { openDB } from '../database/db';

export type MainAccount = {
    id: number;
    saldo: number;
};


export type Incoming = {
    id_entrata: number,
    nome: string,
    nota: string,
    importo: number,
    id_conto_principale: number
}

export const getMainAccount = async (): Promise<MainAccount> => {
    const db = await openDB();
    const rows = await db.getAllAsync<MainAccount>(
        'SELECT id, saldo FROM conto_principale WHERE id = 1;'
    );

    if (rows.length === 0) {
        await db.runAsync('INSERT INTO conto_principale (id, saldo) VALUES (1, 0.0);');
        return { id: 1, saldo: 0 };
    }

    return rows[0];
};

export const updateMainAccountSaldo = async (newSaldo: number): Promise<void> => {
    const db = await openDB();
    await db.runAsync('UPDATE conto_principale SET saldo = ? WHERE id = 1;', [newSaldo]);
};


export const getIncomings = async (): Promise<Incoming[]> => {
    const db = await openDB();
    const rows = await db.getAllAsync<Incoming>(
        'SELECT * FROM entrata WHERE id_conto_principale = 1'
    );

    if (rows.length === 0) {
        return [];
    }

    return rows;
};


export const getIncomingById = async (id: number): Promise<Incoming | null> => {
    const db = await openDB();
    const rows = await db.getAllAsync<Incoming>(
        'SELECT * FROM entrata WHERE id_entrata = ?;',
        [id]
    );

    if (rows.length === 0) {
        return null;
    }

    return rows[0];
}


export const InsertIncoming = async (nome: string, nota: string, importo: number): Promise<number> => {
    const db = await openDB();
    const result = await db.runAsync('INSERT INTO entrata (nome,nota,importo,id_conto_principale) VALUES (?,?,?,1)', [nome, nota, importo]);
    const InsertedID = result.lastInsertRowId as number;

    return InsertedID;
}

export const deleteIncoming = async (id: number): Promise<void> => {
    const db = await openDB();
    await db.runAsync('DELETE FROM entrata WHERE id_entrata = ?;', [id]);
}
