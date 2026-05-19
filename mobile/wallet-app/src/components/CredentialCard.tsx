/**
 * Zeqium Wallet — CredentialCard Component
 *
 * Tarjeta tipo carnet digital con diseño premium oscuro.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, radius, font } from '../theme';
import { StatusBadge } from './StatusBadge';
import type { Credential } from '../database';

interface Props {
    credential: Credential;
    onPress: () => void;
}

export function CredentialCard({ credential, onPress }: Props) {
    const fullName = `${credential.given_name} ${credential.family_name}`.trim() || 'Sin nombre';
    const formattedDate = credential.received_at
        ? new Date(credential.received_at).toLocaleDateString('es-ES', {
            day: '2-digit', month: 'short', year: 'numeric',
        })
        : '';

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.iconContainer}>
                        <MaterialCommunityIcons name="shield-check" size={20} color={colors.primary} />
                    </View>
                    <View>
                        <Text style={styles.docType}>DNI DIGITAL</Text>
                        <Text style={styles.subtitle}>Documento Nacional de Identidad</Text>
                    </View>
                </View>
                <StatusBadge status={credential.status} />
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Body */}
            <View style={styles.body}>
                <View style={styles.field}>
                    <Text style={styles.fieldLabel}>TITULAR</Text>
                    <Text style={styles.fieldValue}>{fullName}</Text>
                </View>
                <View style={styles.row}>
                    <View style={styles.fieldHalf}>
                        <Text style={styles.fieldLabel}>Nº DOCUMENTO</Text>
                        <Text style={styles.fieldMono}>{credential.national_id || '—'}</Text>
                    </View>
                    <View style={styles.fieldHalf}>
                        <Text style={styles.fieldLabel}>RECIBIDO</Text>
                        <Text style={styles.fieldValue}>{formattedDate || '—'}</Text>
                    </View>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Pulsa para ver detalles</Text>
                <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textMuted} />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.bgCard,
        borderRadius: radius.xl,
        padding: spacing.lg,
        marginHorizontal: spacing.base,
        marginBottom: spacing.base,
        borderWidth: 1,
        borderColor: colors.border,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: radius.md,
        backgroundColor: colors.primaryMuted,
        alignItems: 'center',
        justifyContent: 'center',
    },
    docType: {
        fontSize: font.xs,
        fontWeight: '700',
        color: colors.primary,
        letterSpacing: 1.5,
    },
    subtitle: {
        fontSize: font.xs,
        color: colors.textMuted,
        marginTop: 1,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: spacing.md,
    },
    body: {
        gap: spacing.md,
    },
    field: {
        gap: 2,
    },
    fieldLabel: {
        fontSize: font.xs,
        fontWeight: '500',
        color: colors.textMuted,
        letterSpacing: 0.8,
    },
    fieldValue: {
        fontSize: font.md,
        fontWeight: '600',
        color: colors.text,
    },
    fieldMono: {
        fontSize: font.md,
        fontWeight: '700',
        color: colors.text,
        letterSpacing: 1.5,
        fontFamily: 'monospace',
    },
    row: {
        flexDirection: 'row',
        gap: spacing.base,
    },
    fieldHalf: {
        flex: 1,
        gap: 2,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.md,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    footerText: {
        fontSize: font.xs,
        color: colors.textMuted,
    },
});
