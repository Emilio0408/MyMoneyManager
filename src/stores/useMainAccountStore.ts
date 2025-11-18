// src/stores/useMainAccountStore.ts
import { create } from 'zustand';
import { deleteIncoming, getIncomings, getMainAccount, Incoming, InsertIncoming, updateMainAccountSaldo } from '../repositories/mainAccountRepository';




type MainAccountState = {
    saldo: number;
    loading: boolean;
    IncomingData: Array<Incoming>;
    loadSaldo: () => Promise<void>;
    setSaldo: (newSaldo: number) => Promise<void>;
    loadIncomings: () => Promise<void>;
    addIncoming: (nome: string, nota: string, importo: number) => Promise<void>;
    deleteIncoming: (id: number) => Promise<void>;
};

export const useMainAccountStore = create<MainAccountState>((set, get) => ({
    saldo: 0,
    loading: false,
    IncomingData: [],

    loadSaldo: async () => {
        set({ loading: true });
        try {
            const account = await getMainAccount();
            set({ saldo: account.saldo });
        } catch (e) {
            console.error('Errore caricamento conto principale', e);
        } finally {
            set({ loading: false });
        }
    },

    setSaldo: async (newSaldo: number) => {
        set({ loading: true });
        try {

            if (newSaldo < 0) {
                await updateMainAccountSaldo(0);
                set({ saldo: 0 });
            }
            else {
                await updateMainAccountSaldo(newSaldo);
                set({ saldo: newSaldo });
            }


        } catch (e) {
            console.error('Errore aggiornamento saldo', e);
        } finally {
            set({ loading: false });
        }
    },

    loadIncomings: async () => {
        set({ loading: true });

        try {
            const Incomings = await getIncomings();
            set({ IncomingData: Incomings });
        }
        catch (e) {
            console.error('Errore caricamento entrate', e);
        }
        finally {
            set({ loading: false });
        }
    },

    addIncoming: async (nome: string, nota: string, importo: number) => {
        set({ loading: true });
        try {

            //Inseriamo l'entrata nel db
            const newIncomingID = await InsertIncoming(nome, nota, importo);

            //Aggiorniamo il saldo con il nuovo importo
            let newSaldo = get().saldo + importo;
            await updateMainAccountSaldo(newSaldo);
            set({ saldo: newSaldo });

            //Prendiamo la nuova lista di entrate che comprende la nuova entrata inserita dal DB e poi aggiorniamo la lista di entrate
            const currentIncomings = get().IncomingData;
            const newIncoming = {
                id_entrata: newIncomingID,
                nome: nome,
                nota: nota,
                importo: importo,
                id_conto_principale: 1
            };

            set({ IncomingData: currentIncomings.concat([newIncoming]) });
        }
        catch (e) {
            console.error('Errore caricamento conto principale', e);
        }
        finally {
            set({ loading: false });
        }
    },

    deleteIncoming: async (id: number) => {

        //Eliminiamo l'entrata dal DB
        await deleteIncoming(id);


        //Riduciamo il valore del saldo totale sottraendo l'importo dell'entrata eliminata 
        const incomingToDelete = get().IncomingData.find(inc => inc.id_entrata === id);
        const currentSaldo = get().saldo;

        if (!incomingToDelete) {
            // Gestisci il caso in cui l'entrata non esiste
            console.error("Entrata non trovata");
            return;
        }


        if ((currentSaldo - incomingToDelete?.importo) < 0) {
            set({ saldo: 0 });
            await updateMainAccountSaldo(0);
        }
        else {
            set({ saldo: currentSaldo - incomingToDelete.importo });
            await updateMainAccountSaldo(currentSaldo - incomingToDelete.importo);

        }



        //Aggiorniamo la lista di importi disponibili, rimuovendo quello cancellato dal DB anche qui nello store, in modo da sincronizzarlo coi dati del DB
        const currentEntrate = get().IncomingData;
        const newIncomingList = currentEntrate.filter(entrata => entrata.id_entrata != id);
        set({ IncomingData: newIncomingList });

    }

}));
