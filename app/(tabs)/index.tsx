import IncomingList from '@/src/components/IncomingList';
import { checkIfIsReportTime, createReports, updateDateSystem } from '@/src/repositories/ReportRepository';
import { getAllExpensesOfVirtualAccount, getAllMonthlyRefreshVirtualAccount, resetVirtualAccounts, Spesa, VirtualAccount } from '@/src/repositories/virtualAccountRepository';
import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import MainAccountCard from '../../src/components/MainAccountCard';
import { initDB } from '../../src/database/db';
import { useMainAccountStore } from '../../src/stores/useMainAccountStore';



export default function HomeScreen() {



  const loadSaldo = useMainAccountStore((s) => s.loadSaldo);
  const loadIncomings = useMainAccountStore((s) => s.loadIncomings);


  useEffect(() => {
    (async () => {

      await initDB();

      if (await checkIfIsReportTime()) //Vediamo se è necessario fare il reset e il report
      {
        const MonthlyRefreshVirtualAccount: VirtualAccount[] = await getAllMonthlyRefreshVirtualAccount();
        const ExpensesOfRetrievedAccount: Spesa[] = [];
        const IDOfRetrievedVirtualAccounts: number[] = [];


        for (const account of MonthlyRefreshVirtualAccount) {
          if (!(account.id_conto_virtuale)) {
            console.error("Errore nell'operazione di recupero dei conti virtuali");
            return;
          }

          let tmpExpenses: Spesa[] = await getAllExpensesOfVirtualAccount(account.id_conto_virtuale);

          for (const expense of tmpExpenses) {
            ExpensesOfRetrievedAccount.push(expense);
          }

          IDOfRetrievedVirtualAccounts.push(account.id_conto_virtuale);
        }

        if (await createReports(MonthlyRefreshVirtualAccount, ExpensesOfRetrievedAccount) === 1)
          await resetVirtualAccounts(IDOfRetrievedVirtualAccounts);

        //Aggiorniamo la data di accesso al sistema
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();
        updateDateSystem(currentMonth, currentYear);
      }


      await loadSaldo();
      await loadIncomings();
    })();
  }, []);




  return (

    <SafeAreaView style={{ flex: 1, paddingHorizontal: 16, backgroundColor: 'white' }} edges={['top', 'left', 'right']}>
      <MainAccountCard />
      <IncomingList />
    </SafeAreaView>

  );
}
