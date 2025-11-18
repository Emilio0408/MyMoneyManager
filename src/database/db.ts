// src/database/db.ts
import * as SQLite from 'expo-sqlite';

let databaseInstance: SQLite.SQLiteDatabase | null = null;

export const openDB = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!databaseInstance) {
    databaseInstance = await SQLite.openDatabaseAsync('mymoneymanager.db');

    await initDB(databaseInstance);
  }

  return databaseInstance;
};

export const initDB = async (db?: SQLite.SQLiteDatabase) => {
  const database = db || await openDB();

  await database.execAsync(`
        CREATE TABLE IF NOT EXISTS conto_principale (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            saldo REAL NOT NULL
        );

        CREATE TABLE IF NOT EXISTS entrata (
            id_entrata INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            nota TEXT,
            importo REAL NOT NULL,
            id_conto_principale INTEGER NOT NULL,
            FOREIGN KEY (id_conto_principale) REFERENCES conto_principale(id)
        );

        CREATE TABLE IF NOT EXISTS Conto_Virtuale (
            id_conto_virtuale INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            Totale_Spese REAL NOT NULL DEFAULT 0.0,
            Limite INTEGER NOT NULL,
            AggiornamentoMensile BOOLEAN DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS Spesa (
            id_spesa INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            nota TEXT,
            importo REAL NOT NULL,
            id_conto_virtuale INTEGER NOT NULL,
            data TEXT,
            FOREIGN KEY (id_conto_virtuale) REFERENCES Conto_Virtuale(id_conto_virtuale) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS Report (
            Mese INTEGER NOT NULL,
            Anno INTEGER NOT NULL,
            id_conto_virtuale INTEGER NOT NULL,
            Limite REAL,
            Nome TEXT,
            Totale_Spese REAL,
            PRIMARY KEY (Mese, Anno, id_conto_virtuale),
            FOREIGN KEY (id_conto_virtuale) REFERENCES Conto_Virtuale(id_conto_virtuale) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS Storico_Spese (
            id_spesa INTEGER PRIMARY KEY,
            nome TEXT NOT NULL,
            nota TEXT,
            importo REAL NOT NULL,
            id_conto_virtuale INTEGER NOT NULL,
            Mese INTEGER NOT NULL,
            Anno INTEGER NOT NULL,
            data TEXT,
            FOREIGN KEY (id_conto_virtuale, Mese, Anno) 
                REFERENCES report(id_conto_virtuale, Mese, Anno) 
                ON DELETE CASCADE
        );


        CREATE TABLE IF NOT EXISTS Data_Sistema(
            ID INTEGER PRIMARY KEY,
            Mese INTEGER NOT NULL,
            Anno INTEGER NOT NULL
        );

    `);



  //Controlliamo se esiste già il conto principale, in caso negativo lo creiamo

  let rows = await database.getAllAsync<{ cnt: number }>('SELECT COUNT(*) as cnt FROM conto_principale;');
  let count = rows[0]?.cnt ?? 0;


  if (count === 0) {
    await database.runAsync('INSERT INTO conto_principale (id, saldo) VALUES (1, 0.0);');
  }

  //Controlliamo se è stato già inserito un tracciamento del mese attuale, in caso negativo lo creiamo.

  rows = await database.getAllAsync<{ cnt: number }>('SELECT COUNT(*) as cnt FROM Data_Sistema;');
  count = rows[0]?.cnt ?? 0;

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // +1 perché getMonth() restituisce 0-11
  const currentYear = currentDate.getFullYear();

  if (count === 0) {
    await database.runAsync('INSERT INTO Data_Sistema (ID, Mese, Anno) VALUES (1,?,?);', currentMonth, currentYear);
  }


};

export const closeDB = async (): Promise<void> => {
  if (databaseInstance) {
    await databaseInstance.closeAsync();
    databaseInstance = null;
  }
};

export const isDBConnected = (): boolean => {
  return databaseInstance !== null;
};

export const resetDB = async (): Promise<void> => {
  if (databaseInstance) {
    await databaseInstance.closeAsync();
    databaseInstance = null;
  }

  // Cancella il database fisicamente
  await SQLite.deleteDatabaseAsync('mymoneymanager.db');
};