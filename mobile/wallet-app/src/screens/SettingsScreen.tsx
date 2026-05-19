/**
 * Zeqium Wallet — SettingsScreen
 *
 * Configuración del servidor, info del dispositivo, reset.
 */

import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, font, radius } from '../theme';
import { DEFAULT_SERVER_URL, STORE_KEYS } from '../config';
import { deleteAllCredentials } from '../database';

export function SettingsScreen({ navigation }: any) {
    const [serverUrl, setServerUrl] = useState(DEFAULT_SERVER_URL);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const url = await SecureStore.getItemAsync(STORE_KEYS.SERVER_URL);
        if (url) setServerUrl(url);
    };

    const saveUrl = async () => {
        await SecureStore.setItemAsync(STORE_KEYS.SERVER_URL, serverUrl);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleReset = () => {
        Alert.alert(
            'Restablecer wallet',
            'Se eliminarán todas las credenciales almacenadas. Esta acción no se puede deshacer.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Restablecer',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteAllCredentials();
                        await SecureStore.deleteItemAsync(STORE_KEYS.SERVER_URL);
                        Alert.alert('Wallet restablecida', 'Todas las credenciales han sido eliminadas.');
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" size={22} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Ajustes</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Server URL */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>SERVIDOR</Text>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>URL del backend Zeqium</Text>
                        <TextInput
                            style={styles.input}
                            value={serverUrl}
                            onChangeText={setServerUrl}
                            placeholder="http://localhost"
                            placeholderTextColor={colors.textMuted}
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="url"
                        />
                        <TouchableOpacity style={styles.saveBtn} onPress={saveUrl}>
                            <MaterialCommunityIcons
                                name={saved ? 'check' : 'content-save-outline'}
                                size={18}
                                color={saved ? colors.success : colors.white}
                            />
                            <Text style={[styles.saveBtnText, saved ? { color: colors.success } : undefined]}>
                                {saved ? 'Guardado' : 'Guardar'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* App info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>INFORMACIÓN</Text>
                    <InfoRow label="Versión" value="1.0.0" />
                    <InfoRow label="SDK" value="Expo 54" />
                    <InfoRow label="Proyecto" value="Zeqium SSI Wallet" />
                </View>

                {/* Danger zone */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.danger }]}>ZONA DE PELIGRO</Text>
                    <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
                        <MaterialCommunityIcons name="delete-forever-outline" size={20} color={colors.danger} />
                        <Text style={styles.resetBtnText}>Restablecer wallet</Text>
                    </TouchableOpacity>
                    <Text style={styles.resetDesc}>
                        Elimina todas las credenciales y configuración almacenada.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <View style={infoStyles.row}>
            <Text style={infoStyles.label}>{label}</Text>
            <Text style={infoStyles.value}>{value}</Text>
        </View>
    );
}

const infoStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    label: {
        fontSize: font.base,
        color: colors.textSecondary,
    },
    value: {
        fontSize: font.base,
        color: colors.text,
        fontWeight: '500',
    },
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: spacing['4xl'] + spacing.sm,
        paddingHorizontal: spacing.base,
        paddingBottom: spacing.md,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: radius.md,
        backgroundColor: colors.bgElevated,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: font.md,
        fontWeight: '600',
        color: colors.text,
    },
    content: {
        padding: spacing.xl,
        paddingBottom: spacing['4xl'],
    },
    section: {
        marginBottom: spacing['2xl'],
    },
    sectionTitle: {
        fontSize: font.xs,
        fontWeight: '600',
        color: colors.textMuted,
        letterSpacing: 1,
        marginBottom: spacing.md,
    },
    inputGroup: {
        backgroundColor: colors.bgCard,
        borderRadius: radius.lg,
        padding: spacing.base,
        borderWidth: 1,
        borderColor: colors.border,
    },
    inputLabel: {
        fontSize: font.sm,
        color: colors.textMuted,
        marginBottom: spacing.sm,
    },
    input: {
        backgroundColor: colors.bgInput,
        borderRadius: radius.md,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.md,
        fontSize: font.base,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.md,
    },
    saveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        borderRadius: radius.md,
    },
    saveBtnText: {
        fontSize: font.base,
        fontWeight: '600',
        color: colors.white,
    },
    resetBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        backgroundColor: colors.dangerBg,
        padding: spacing.base,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    resetBtnText: {
        fontSize: font.base,
        fontWeight: '600',
        color: colors.danger,
    },
    resetDesc: {
        fontSize: font.sm,
        color: colors.textMuted,
        marginTop: spacing.sm,
    },
});
