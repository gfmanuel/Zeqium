/**
 * Zeqium Wallet — CredentialDetailScreen
 *
 * Vista detalle de una credencial tipo carnet digital.
 */

import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, font, radius } from '../theme';
import { StatusBadge } from '../components/StatusBadge';
import { getCredentialById, deleteCredential, type Credential } from '../database';

export function CredentialDetailScreen({ route, navigation }: any) {
    const { id } = route.params;
    const [credential, setCredential] = useState<Credential | null>(null);

    useEffect(() => {
        loadCredential();
    }, []);

    const loadCredential = async () => {
        const cred = await getCredentialById(id);
        setCredential(cred);
    };

    const handleDelete = () => {
        Alert.alert(
            'Eliminar credencial',
            '¿Estás seguro de que quieres eliminar esta credencial de tu wallet?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteCredential(id);
                        navigation.goBack();
                    },
                },
            ]
        );
    };

    if (!credential) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Cargando...</Text>
            </View>
        );
    }

    const fullName = `${credential.given_name} ${credential.family_name}`.trim();
    const receivedDate = new Date(credential.received_at).toLocaleDateString('es-ES', {
        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" size={22} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Credencial</Text>
                <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                    <MaterialCommunityIcons name="delete-outline" size={20} color={colors.danger} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Card visual */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardBrand}>
                            <MaterialCommunityIcons name="shield-check" size={24} color={colors.primary} />
                            <View>
                                <Text style={styles.cardTitle}>DNI DIGITAL</Text>
                                <Text style={styles.cardSub}>Documento Nacional de Identidad</Text>
                            </View>
                        </View>
                        <StatusBadge status={credential.status} />
                    </View>

                    <View style={styles.cardDivider} />

                    <Text style={styles.cardName}>{fullName || 'Sin nombre'}</Text>
                    <Text style={styles.cardDocNum}>{credential.national_id || '—'}</Text>
                </View>

                {/* Detail fields */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Datos personales</Text>
                    <DetailRow label="Nombre" value={credential.given_name} icon="account-outline" />
                    <DetailRow label="Apellidos" value={credential.family_name} icon="account-outline" />
                    <DetailRow label="Nº Documento" value={credential.national_id} icon="card-account-details-outline" />
                    <DetailRow label="Fecha de nacimiento" value={credential.birth_date} icon="calendar-outline" />
                    <DetailRow label="Nacionalidad" value={credential.nationality} icon="flag-outline" />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Información técnica</Text>
                    <DetailRow label="Emisor (DID)" value={credential.issuer_did} icon="key-outline" mono />
                    <DetailRow label="Recibida" value={receivedDate} icon="clock-outline" />
                    <DetailRow label="ID interno" value={credential.id} icon="identifier" mono />
                </View>
            </ScrollView>
        </View>
    );
}

function DetailRow({ label, value, icon, mono }: { label: string; value: string; icon: string; mono?: boolean }) {
    return (
        <View style={detailStyles.row}>
            <View style={detailStyles.iconBox}>
                <MaterialCommunityIcons name={icon as any} size={16} color={colors.textMuted} />
            </View>
            <View style={detailStyles.content}>
                <Text style={detailStyles.label}>{label}</Text>
                <Text style={[detailStyles.value, mono ? detailStyles.mono : undefined]}>{value || '—'}</Text>
            </View>
        </View>
    );
}

const detailStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        gap: spacing.md,
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: radius.sm,
        backgroundColor: colors.bgElevated,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    content: {
        flex: 1,
        gap: 2,
    },
    label: {
        fontSize: font.xs,
        color: colors.textMuted,
        fontWeight: '500',
    },
    value: {
        fontSize: font.base,
        color: colors.text,
        fontWeight: '500',
    },
    mono: {
        fontFamily: 'monospace',
        fontSize: font.sm,
    },
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    loadingText: {
        color: colors.textMuted,
        textAlign: 'center',
        marginTop: '50%',
        fontSize: font.base,
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
    deleteBtn: {
        width: 40,
        height: 40,
        borderRadius: radius.md,
        backgroundColor: colors.dangerBg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        padding: spacing.base,
        paddingBottom: spacing['4xl'],
    },
    card: {
        backgroundColor: colors.bgCard,
        borderRadius: radius.xl,
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.xl,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardBrand: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    cardTitle: {
        fontSize: font.sm,
        fontWeight: '700',
        color: colors.primary,
        letterSpacing: 1.5,
    },
    cardSub: {
        fontSize: font.xs,
        color: colors.textMuted,
    },
    cardDivider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: spacing.lg,
    },
    cardName: {
        fontSize: font['2xl'],
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    cardDocNum: {
        fontSize: font.lg,
        fontWeight: '600',
        color: colors.textSecondary,
        letterSpacing: 2,
        fontFamily: 'monospace',
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: font.sm,
        fontWeight: '600',
        color: colors.textMuted,
        letterSpacing: 0.5,
        marginBottom: spacing.sm,
        textTransform: 'uppercase',
    },
});
