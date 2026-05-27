/**
 * Zeqium Wallet — HotelCheckinScreen
 *
 * Tras escanear el QR del hotel, el usuario elige qué claims divulgar
 * y envía la presentación cifrada (JWE) al verificador.
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, font, radius } from '../theme';
import type { QRPayload, RequestedClaim } from '../types/presentation';
import { getAllCredentials, type Credential } from '../database';
import { listDisclosableClaims } from '../services/sdjwtPresentation';
import { submitHotelCheckin } from '../services/hotelCheckin';
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { ParamListBase } from '@react-navigation/native'

type Props = NativeStackScreenProps<ParamListBase & { HotelCheckin: { qrPayload: QRPayload } }, 'HotelCheckin'>

export function HotelCheckinScreen({ route, navigation }: Props) {
    const { qrPayload } = route.params;
    const [credentials, setCredentials] = useState<Credential[]>([]);
    const [selectedCredId, setSelectedCredId] = useState<string | null>(null);
    const [selectedClaims, setSelectedClaims] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const requestedClaims: RequestedClaim[] = qrPayload.requestedClaims || [];
    const requiredKeys = useMemo(
        () => requestedClaims.filter((c) => c.required).map((c) => c.key),
        [requestedClaims]
    );

    useEffect(() => {
        (async () => {
            const creds = await getAllCredentials();
            setCredentials(creds);
            if (creds.length > 0) {
                setSelectedCredId(creds[0].id);
            }
            setSelectedClaims(new Set(requiredKeys));
            setLoading(false);
        })();
    }, [requiredKeys]);

    const selectedCredential = credentials.find((c) => c.id === selectedCredId) || null;
    const availableClaims = useMemo(() => {
        if (!selectedCredential) return [] as string[];
        return listDisclosableClaims(selectedCredential.raw_jwt);
    }, [selectedCredential]);

    const toggleClaim = (key: string, required: boolean) => {
        if (required) return;
        setSelectedClaims((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const handleSubmit = async () => {
        if (!selectedCredential) {
            Alert.alert('Sin credencial', 'Necesitas un DNI digital en la wallet.');
            return;
        }

        const missingRequired = requiredKeys.filter((k) => !selectedClaims.has(k));
        if (missingRequired.length > 0) {
            Alert.alert('Datos insuficientes', `Faltan campos obligatorios: ${missingRequired.join(', ')}`);
            return;
        }

        const missingInCred = [...selectedClaims].filter((k) => !availableClaims.includes(k));
        if (missingInCred.length > 0) {
            Alert.alert(
                'Credencial incompleta',
                `Tu credencial no contiene: ${missingInCred.join(', ')}`
            );
            return;
        }

        setSubmitting(true);
        try {
            const result = await submitHotelCheckin(
                qrPayload,
                selectedCredential.raw_jwt,
                [...selectedClaims]
            );

            Alert.alert(
                'Check-in completado',
                `${result.user_checked_in?.nombre || 'Huésped'} — Habitación ${result.user_checked_in?.habitacion || '—'}`,
                [{ text: 'OK', onPress: () => navigation.popToTop() }]
            );
        } catch (err) {
            Alert.alert(
                'Check-in rechazado',
                err instanceof Error ? err.message : 'No se pudo completar el check-in'
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" size={22} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Check-in hotel</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.banner}>
                    <MaterialCommunityIcons name="office-building" size={22} color={colors.primary} />
                    <View style={styles.bannerText}>
                        <Text style={styles.bannerTitle}>Solicitud de verificación</Text>
                        <Text style={styles.bannerSub}>
                            {qrPayload.hotelDid || 'Hotel Zeqium'}
                        </Text>
                    </View>
                </View>

                {credentials.length === 0 ? (
                    <View style={styles.emptyBox}>
                        <Text style={styles.emptyText}>
                            No tienes credenciales. Escanea primero el QR de la policía.
                        </Text>
                    </View>
                ) : (
                    <>
                        {credentials.length > 1 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>CREDENCIAL</Text>
                                {credentials.map((cred) => (
                                    <TouchableOpacity
                                        key={cred.id}
                                        style={[
                                            styles.credOption,
                                            selectedCredId === cred.id && styles.credOptionActive,
                                        ]}
                                        onPress={() => {
                                            setSelectedCredId(cred.id);
                                            setSelectedClaims(new Set(requiredKeys));
                                        }}
                                    >
                                        <Text style={styles.credName}>
                                            {cred.given_name} {cred.family_name}
                                        </Text>
                                        <Text style={styles.credMeta}>{cred.national_id}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>DATOS A COMPARTIR</Text>
                            <Text style={styles.sectionHint}>
                                Los campos obligatorios son necesarios para el check-in.
                            </Text>
                            {requestedClaims.map((claim) => {
                                const available = availableClaims.includes(claim.key);
                                const checked = selectedClaims.has(claim.key);
                                return (
                                    <TouchableOpacity
                                        key={claim.key}
                                        style={[styles.claimRow, !available && styles.claimDisabled]}
                                        onPress={() => toggleClaim(claim.key, claim.required)}
                                        disabled={!available || claim.required}
                                    >
                                        <MaterialCommunityIcons
                                            name={
                                                checked
                                                    ? claim.required
                                                        ? 'checkbox-marked-circle'
                                                        : 'checkbox-marked'
                                                    : 'checkbox-blank-outline'
                                            }
                                            size={22}
                                            color={
                                                !available
                                                    ? colors.textMuted
                                                    : checked
                                                        ? colors.primary
                                                        : colors.textSecondary
                                            }
                                        />
                                        <View style={styles.claimContent}>
                                            <Text style={styles.claimLabel}>{claim.label}</Text>
                                            <Text style={styles.claimKey}>{claim.key}</Text>
                                        </View>
                                        {claim.required && (
                                            <Text style={styles.requiredBadge}>Obligatorio</Text>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <TouchableOpacity
                            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
                            onPress={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color={colors.white} />
                            ) : (
                                <>
                                    <MaterialCommunityIcons name="shield-lock-outline" size={20} color={colors.white} />
                                    <Text style={styles.submitText}>Enviar cifrado al hotel</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: spacing['4xl'] + spacing.sm,
        paddingHorizontal: spacing.base,
        paddingBottom: spacing.md,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: radius.md,
        backgroundColor: colors.bgElevated, alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { fontSize: font.md, fontWeight: '600', color: colors.text },
    content: { padding: spacing.xl, paddingBottom: spacing['4xl'] },
    banner: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.md,
        backgroundColor: colors.bgCard, borderRadius: radius.lg,
        padding: spacing.base, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.xl,
    },
    bannerText: { flex: 1 },
    bannerTitle: { fontSize: font.base, fontWeight: '600', color: colors.text },
    bannerSub: { fontSize: font.xs, color: colors.textMuted, marginTop: 2 },
    section: { marginBottom: spacing.xl },
    sectionTitle: {
        fontSize: font.xs, fontWeight: '600', color: colors.textMuted,
        letterSpacing: 1, marginBottom: spacing.sm,
    },
    sectionHint: { fontSize: font.sm, color: colors.textSecondary, marginBottom: spacing.md },
    credOption: {
        padding: spacing.base, borderRadius: radius.md, borderWidth: 1,
        borderColor: colors.border, marginBottom: spacing.sm, backgroundColor: colors.bgCard,
    },
    credOptionActive: { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
    credName: { fontSize: font.base, fontWeight: '600', color: colors.text },
    credMeta: { fontSize: font.sm, color: colors.textMuted, marginTop: 2 },
    claimRow: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.md,
        paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    claimDisabled: { opacity: 0.45 },
    claimContent: { flex: 1 },
    claimLabel: { fontSize: font.base, color: colors.text, fontWeight: '500' },
    claimKey: { fontSize: font.xs, color: colors.textMuted, marginTop: 2 },
    requiredBadge: {
        fontSize: font.xs, color: colors.primary, fontWeight: '600',
    },
    submitBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
        backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: radius.lg,
        marginTop: spacing.md,
    },
    submitBtnDisabled: { opacity: 0.7 },
    submitText: { fontSize: font.base, fontWeight: '600', color: colors.white },
    emptyBox: {
        padding: spacing.xl, backgroundColor: colors.bgCard, borderRadius: radius.lg,
        borderWidth: 1, borderColor: colors.border,
    },
    emptyText: { fontSize: font.base, color: colors.textSecondary, textAlign: 'center' },
});
