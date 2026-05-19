/**
 * Zeqium Wallet — StatusBadge Component
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, font, spacing } from '../theme';

type Status = 'ACTIVE' | 'REVOKED' | 'EXPIRED';

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string }> = {
    ACTIVE: { label: 'Activa', color: colors.success, bg: colors.successBg },
    REVOKED: { label: 'Revocada', color: colors.danger, bg: colors.dangerBg },
    EXPIRED: { label: 'Expirada', color: colors.warning, bg: colors.warningBg },
};

interface Props {
    status: Status;
}

export function StatusBadge({ status }: Props) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.ACTIVE;
    return (
        <View style={[styles.badge, { backgroundColor: config.bg }]}>
            <View style={[styles.dot, { backgroundColor: config.color }]} />
            <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm + 2,
        paddingVertical: spacing.xs,
        borderRadius: radius.full,
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    label: {
        fontSize: font.xs,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
});
