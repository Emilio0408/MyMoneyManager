// app/(tabs)/_layout.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabsLayout() {



    return (

        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#1a237e',
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderTopWidth: 2,
                    borderTopColor: '#1a237e',
                    elevation: 6,
                    shadowColor: '#1a237e',
                    shadowOffset: { width: 0, height: -3 },
                    shadowOpacity: 0.15,
                    shadowRadius: 6,
                    height: 70,
                },
                tabBarBackground: () => null,

            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Conto Principale',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="account-balance" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="VirtualAccountTab"
                options={{
                    title: 'Conti virtuali',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="payment" size={size} color={color} />
                    ),
                }}
            />

        </Tabs>
    );
}
