/**
 * Zeqium Wallet — App Entry Point
 *
 * Inicializa la base de datos y configura la navegación.
 */

import 'react-native-get-random-values';

import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { initDatabase } from './src/database';
import { colors } from './src/theme';

// Screens
import { HomeScreen } from './src/screens/HomeScreen';
import { ScannerScreen } from './src/screens/ScannerScreen';
import { HotelCheckinScreen } from './src/screens/HotelCheckinScreen';
import { CredentialDetailScreen } from './src/screens/CredentialDetailScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();

const zeqiumTheme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        background: colors.bg,
        card: colors.bg,
        text: colors.text,
        border: colors.border,
        primary: colors.primary,
        notification: colors.primary,
    },
};

export default function App() {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        (async () => {
            await initDatabase();
            setReady(true);
        })();
    }, []);

    if (!ready) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <>
            <StatusBar style="light" backgroundColor={colors.bg} />
            <NavigationContainer theme={zeqiumTheme}>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Home" component={HomeScreen} />
                    <Stack.Screen name="Scanner" component={ScannerScreen} />
                    <Stack.Screen name="HotelCheckin" component={HotelCheckinScreen as any} />
                    <Stack.Screen name="CredentialDetail" component={CredentialDetailScreen} />
                    <Stack.Screen name="Settings" component={SettingsScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </>
    );
}

const styles = StyleSheet.create({
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.bg,
    },
});
