import { create } from 'zustand';
import { deleteExpenseInVirtualAccount, getAllExpensesOfVirtualAccount, getExpense, getVirtualAccount, insertExpenseInVirtualAccount, Spesa, updateVirtualAccountLimit, updateVirtualAccountName, updateVirtualAccountTotaleSpese, VirtualAccount } from "../repositories/virtualAccountRepository";
import { useMainAccountStore } from './useMainAccountStore';
import { useVirtualAccountsStore } from './useVirtualAccountsStore'; // Importa l'altro store



export type ManageVirtualAccountState = {
    expenses: Array<Spesa>,
    NomeConto: string,
    LimiteConto: number,
    TotaleSpese: number,
    AggiornamentoMensile: number,
    loadVirtualAccountDetails: (id_conto_virtuale: number) => Promise<void>,
    updateNomeConto: (id_conto_virtuale: number, newName: string) => Promise<void>,
    updateLimiteConto: (id_conto_virtuale: number, newLimit: number) => Promise<void>,
    insertExpense: (expense: Spesa) => Promise<void>,
    deleteExpense: (id_spesa: number) => Promise<void>
}


///Nota : Quando avviene una modifica, chiamare la funzione "loadVirtualAccount" del VirtualAccountStore, in modo che i dati dei conti vengano aggiornati anche in quello store e di conseguenza in tutti i componenti che lo usano (la lista di conti virtuali)

export const useManageVirtualAccountStore = create<ManageVirtualAccountState>((set, get) => ({



    NomeConto: '',

    LimiteConto: 0,

    TotaleSpese: 0,

    expenses: [],

    AggiornamentoMensile: 0,


    loadVirtualAccountDetails: async (id_conto_virtuale: number) => {

        try {
            const virtualAccount: VirtualAccount | null = await getVirtualAccount(id_conto_virtuale);
            const allExpensesOfVirtualAccount: Spesa[] = await getAllExpensesOfVirtualAccount(id_conto_virtuale);
            set(
                {
                    expenses: allExpensesOfVirtualAccount,
                    NomeConto: virtualAccount?.nome,
                    LimiteConto: virtualAccount?.Limite,
                    TotaleSpese: virtualAccount?.Totale_Spese,
                    AggiornamentoMensile: virtualAccount?.AggiornamentoMensile
                });
        } catch (e) {
            console.error("Errore nel caricamento delle spese del conto virtuale", e)
        }


    },


    updateNomeConto: async (id_conto_virtuale: number, newName: string) => {
        try {
            //Modifichiamo i dati nel db
            await updateVirtualAccountName(id_conto_virtuale, newName);
            set({ NomeConto: newName });

            //Aggiorna anche la lista di conti virtuali in modo che i componenti che la visualizzano si aggiornino a sua volta con le nuove modifiche
            const { loadVirtualAccount } = useVirtualAccountsStore.getState();
            await loadVirtualAccount();

        } catch (e) {
            console.error("Errore nell'aggiornamento del nome del conto virtuale", e)
        }
    },

    updateLimiteConto: async (id_conto_virtuale: number, limite: number) => {
        try {
            //Modifichiamo i dati nel db
            await updateVirtualAccountLimit(id_conto_virtuale, limite);
            set({ LimiteConto: limite });

            //Aggiorna anche la lista di conti virtuali in modo che i componenti che la visualizzano si aggiornino a sua volta con le nuove modifiche
            const { loadVirtualAccount } = useVirtualAccountsStore.getState();
            await loadVirtualAccount();

        } catch (e) {
            console.error("Errore nell'aggiornamento del limite del conto virtuale", e)
        }
    },

    insertExpense: async (expense: Spesa) => {
        try {

            //Aggiugniamo la spesa al DB 
            const new_expense_id = await insertExpenseInVirtualAccount(expense);

            //Calcoliamo il nuovo totale speso e modifichiamo il dato nel DB
            const newTotaleSpese = get().TotaleSpese + expense.importo;
            await updateVirtualAccountTotaleSpese(expense.id_conto_virtuale, newTotaleSpese);

            //Creiamo la nuova spesa per aggiornare lo store
            const currentExpenses = get().expenses;
            const newExpense: Spesa = {
                id_spesa: new_expense_id,
                nome: expense.nome,
                nota: expense.nota,
                importo: expense.importo,
                data: expense.data,
                id_conto_virtuale: expense.id_conto_virtuale
            }

            //Aggiorniamo lo store coi nuovi dati
            set({ expenses: currentExpenses.concat(newExpense), TotaleSpese: newTotaleSpese })


            //Aggiorniamo anche la lista di conti virtuali in modo che prelevino i nuovi dati
            const { loadVirtualAccount } = useVirtualAccountsStore.getState();
            await loadVirtualAccount();

            //Aggiorniamo anche il contoPrincipale sottraendo la nuova spesa
            const { saldo, setSaldo } = useMainAccountStore.getState();
            const newSaldo = saldo - expense.importo;
            setSaldo(newSaldo);

        }
        catch (e) {
            console.error("Errore nell'inserimento della spesa", e);
        }
    },

    deleteExpense: async (id_spesa: number) => {
        try {
            //recuperiamo i dati della spesa dal DB e poi cancelliamola da esso
            const dataOfDeletedExpense: Spesa | null = await getExpense(id_spesa);

            if (dataOfDeletedExpense === null) {
                console.error("id spesa errato")
                return;
            }

            await deleteExpenseInVirtualAccount(id_spesa);

            //Calcoliamo il nuovo totale speso e aggiorniamo il DB col nuovo dato
            const newTotaleSpese = get().TotaleSpese - dataOfDeletedExpense.importo;
            await updateVirtualAccountTotaleSpese(dataOfDeletedExpense.id_conto_virtuale, newTotaleSpese);



            //Aggiorniamo i dati anche nello store
            const currentExpenses = get().expenses;
            const newExpensesList = currentExpenses.filter(expense => expense.id_spesa != id_spesa);

            set({ expenses: newExpensesList, TotaleSpese: newTotaleSpese });


            //aggiorniamo i dati anche negli altri store in modo da causare il refresh dei componenti coi nuovi dati


            const { loadVirtualAccount } = useVirtualAccountsStore.getState();
            await loadVirtualAccount();

            const { saldo, setSaldo } = useMainAccountStore.getState();
            const newSaldo = saldo + dataOfDeletedExpense.importo;
            setSaldo(newSaldo);
        }
        catch (e) {
            console.error("Errore nella cancellazione della spesa", e);

        }
    }


}));