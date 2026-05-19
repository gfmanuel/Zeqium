/**
 * Zeqium Wallet — HomeScreen
 *
 * Lista de credenciales almacenadas con FAB para escanear nuevas.
 */

import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, font, radius } from '../theme';
import { CredentialCard } from '../components/CredentialCard';
import { getAllCredentials, type Credential } from '../database';

export function HomeScreen({ navigation }: any) {
    const [credentials, setCredentials] = useState<Credential[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadCredentials = useCallback(async () => {
        try {
            const creds = await getAllCredentials();
            setCredentials(creds);
        } catch (err) {
            console.warn('Error loading credentials:', err);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadCredentials();
        }, [loadCredentials])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadCredentials();
        setRefreshing(false);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Zeqium Wallet</Text>
                    <Text style={styles.subtitle}>Tu identidad digital segura</Text>
                </View>
                <TouchableOpacity
                    style={styles.settingsBtn}
                    onPress={() => navigation.navigate('Settings')}
                >
                    <MaterialCommunityIcons name="cog-outline" size={22} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            {/* Credential count */}
            <View style={styles.countBar}>
                <MaterialCommunityIcons name="wallet-outline" size={16} color={colors.textMuted} />
                <Text style={styles.countText}>
                    {credentials.length === 0
                        ? 'Sin credenciales'
                        : `${credentials.length} credencial${credentials.length > 1 ? 'es' : ''}`}
                </Text>
            </View>

            {/* Content */}
            {credentials.length === 0 ? (
                <View style={styles.empty}>
                    <View style={styles.emptyIcon}>
                        <MaterialCommunityIcons name="card-account-details-outline" size={48} color={colors.textMuted} />
                    </View>
                    <Text style={styles.emptyTitle}>No tienes credenciales</Text>
                    <Text style={styles.emptyDesc}>
                        Escanea el código QR generado por la policía{'\n'}para añadir tu DNI digital a la wallet.
                    </Text>
                    <TouchableOpacity
                        style={styles.emptyButton}
                        onPress={() => navigation.navigate('Scanner')}
                    >
                        <MaterialCommunityIcons name="qrcode-scan" size={18} color={colors.white} />
                        <Text style={styles.emptyButtonText}>Escanear QR</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={credentials}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                    }
                    renderItem={({ item }) => (
                        <CredentialCard
                            credential={item}
                            onPress={() => navigation.navigate('CredentialDetail', { id: item.id })}
                        />
                    )}
                />
            )}

            {/* FAB */}
            {credentials.length > 0 && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => navigation.navigate('Scanner')}
                    activeOpacity={0.85}
                >
                    <MaterialCommunityIcons name="qrcode-scan" size={24} color={colors.white} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingTop: spacing['4xl'] + spacing.base,
        paddingBottom: spacing.base,
    },
    greeting: {
        fontSize: font.xl,
        fontWeight: '700',
        color: colors.text,
    },
    subtitle: {
        fontSize: font.sm,
        color: colors.textMuted,
        marginTop: 2,
    },
    settingsBtn: {
        width: 40,
        height: 40,
        borderRadius: radius.md,
        backgroundColor: colors.bgElevated,
        alignItems: 'center',
        justifyContent: 'center',
    },
    countBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.md,
    },
    countText: {
        fontSize: font.xs,
        color: colors.textMuted,
    },
    list: {
        paddingTop: spacing.sm,
        paddingBottom: spacing['4xl'] + spacing['2xl'],
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing['2xl'],
    },
    emptyIcon: {
        width: 88,
        height: 88,
        borderRadius: radius.xl,
        backgroundColor: colors.bgElevated,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xl,
    },
    emptyTitle: {
        fontSize: font.lg,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    emptyDesc: {
        fontSize: font.base,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: font.base * 1.6,
        marginBottom: spacing.xl,
    },
    emptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: radius.lg,
    },
    emptyButtonText: {
        fontSize: font.base,
        fontWeight: '600',
        color: colors.white,
    },
    fab: {
        position: 'absolute',
        bottom: spacing['2xl'],
        right: spacing.xl,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
});
