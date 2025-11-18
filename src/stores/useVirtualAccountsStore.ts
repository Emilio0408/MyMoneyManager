import { create } from 'zustand';
import { VirtualAccount, deleteVirtualAcccount, getAllVirtualAccount, insertVirtualAccount } from '../repositories/virtualAccountRepository';


type VirtualAccountState = {

    virtualAccounts: Array<VirtualAccount>,
    loadVirtualAccount: () => Promise<void>,
    insertVirtualAccount: (virtualAccount: VirtualAccount) => Promise<void>,
    deleteVirtualAcccount: (id: number) => Promise<void>
};



export const useVirtualAccountsStore = create<VirtualAccountState>((set, get) => ({
    virtualAccounts: [],

    loadVirtualAccount: async () => {
        try {
            const allVirtualAccounts = await getAllVirtualAccount();
            set({ virtualAccounts: allVirtualAccounts });
        }
        catch (e) {
            console.error("Errore nel recupero dei conti virtuali: ", e);
        }
    },

    insertVirtualAccount: async (virtualAccount: VirtualAccount) => {

        try {
            const id_new_virtual_account = await insertVirtualAccount(virtualAccount);
            const currentVirtualAccounts = get().virtualAccounts;
            const newVirtualAccount: VirtualAccount = {
                id_conto_virtuale: id_new_virtual_account,
                nome: virtualAccount.nome,
                Totale_Spese: virtualAccount.Totale_Spese,
                Limite: virtualAccount.Limite,
                AggiornamentoMensile: virtualAccount.AggiornamentoMensile
            }

            set({ virtualAccounts: currentVirtualAccounts.concat(newVirtualAccount) });
        }
        catch (e) {
            console.error("Errore nell'inserimento dei conti virtuali: ", e);
        }

    },

    deleteVirtualAcccount: async (id: number) => {

        try {
            //Cancelliamo l'account virtuale dal DB
            await deleteVirtualAcccount(id);
        }
        catch (e) {
            console.error("Errore nella cancellazione dei conti virtuali: ", e);
        }


    }






}))