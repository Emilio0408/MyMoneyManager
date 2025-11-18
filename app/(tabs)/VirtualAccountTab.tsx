
import { useVirtualAccountsStore } from '@/src/stores/useVirtualAccountsStore';
import { useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import VirtualAccountLists from '../../src/components/VirtualAccountsLists';

export default function ContiVirtualiScreen() {

    const loadVirtualAccounts = useVirtualAccountsStore((state) => state.loadVirtualAccount);


    useFocusEffect(
        useCallback(() => {
            (async () => {
                loadVirtualAccounts();
            })();
        }, [])
    );


    return (
        <SafeAreaView style={{ flex: 1, paddingHorizontal: 16, backgroundColor: 'white' }} edges={['top', 'left', 'right']}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <VirtualAccountLists />
            </GestureHandlerRootView>
        </SafeAreaView>

    );


}