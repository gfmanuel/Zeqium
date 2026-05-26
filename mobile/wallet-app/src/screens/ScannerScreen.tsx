/**
 * Zeqium Wallet — ScannerScreen
 *
 * Escanea QR de credencial (policía) o solicitud de check-in (hotel).
 */

import React, { useState } from 'react';
import {
    View, Text, StyleSheet, Alert, Dimensions, TouchableOpacity,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, font, radius } from '../theme';
import { parseSDJWT, claimToString, saveCredential, type Credential } from '../database';
import { parsePresentationQR } from '../services/sdjwtPresentation';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCAN_AREA = SCREEN_WIDTH * 0.7;

export function ScannerScreen({ navigation }: any) {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [processing, setProcessing] = useState(false);

    const resetScan = () => {
        setScanned(false);
        setProcessing(false);
    };

    const handleBarCodeScanned = async (result: { data: string }) => {
        if (scanned || processing) return;
        setScanned(true);
        setProcessing(true);

        try {
            const data = result.data.trim();

            const presentationRequest = parsePresentationQR(data);
            if (presentationRequest) {
                navigation.replace('HotelCheckin', { qrPayload: presentationRequest });
                return;
            }

            if (!data.includes('eyJ')) {
                Alert.alert(
                    'QR no válido',
                    'Escanea un QR de credencial (policía) o de check-in (hotel).',
                    [{ text: 'Reintentar', onPress: resetScan }]
                );
                return;
            }

            const claims = parseSDJWT(data);
            const id = `cred_${Date.now()}`;

            const credential: Credential = {
                id,
                raw_jwt: data,
                given_name: claimToString(claims.given_name ?? claims.nombre),
                family_name: claimToString(claims.family_name ?? claims.apellidos),
                birth_date: claimToString(claims.birth_date ?? claims.fecha_nacimiento),
                national_id: claimToString(claims.national_id ?? claims.numero_documento),
                nationality: claimToString(claims.nationality ?? claims.nacionalidad),
                issuer_did: claimToString(claims.iss),
                status: 'ACTIVE',
                received_at: new Date().toISOString(),
            };

            await saveCredential(credential);

            Alert.alert(
                'Credencial recibida',
                `Se ha almacenado la credencial de ${credential.given_name} ${credential.family_name}`,
                [{ text: 'Ver credencial', onPress: () => navigation.replace('CredentialDetail', { id }) }]
            );
        } catch {
            Alert.alert(
                'Error',
                'No se pudo procesar el código QR.',
                [{ text: 'Reintentar', onPress: resetScan }]
            );
        }
    };

    if (!permission) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Verificando permisos...</Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <View style={styles.permissionBox}>
                    <View style={styles.permIcon}>
                        <MaterialCommunityIcons name="camera-off-outline" size={48} color={colors.textMuted} />
                    </View>
                    <Text style={styles.permTitle}>Acceso a la cámara</Text>
                    <Text style={styles.permDesc}>
                        Necesitamos acceso a la cámara para escanear códigos QR.
                    </Text>
                    <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
                        <Text style={styles.permBtnText}>Permitir acceso</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.backLink}>Volver</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            />

            <View style={styles.overlay}>
                <View style={styles.topBar}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <MaterialCommunityIcons name="arrow-left" size={22} color={colors.white} />
                    </TouchableOpacity>
                    <Text style={styles.topTitle}>Escanear QR</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.scanCenter}>
                    <View style={styles.scanArea}>
                        <View style={[styles.corner, styles.tl]} />
                        <View style={[styles.corner, styles.tr]} />
                        <View style={[styles.corner, styles.bl]} />
                        <View style={[styles.corner, styles.br]} />
                    </View>
                </View>

                <View style={styles.bottom}>
                    <Text style={styles.instruction}>
                        Policía: QR de credencial{'\n'}Hotel: QR de check-in
                    </Text>
                    {processing && (
                        <Text style={styles.processingText}>Procesando...</Text>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.black },
    loadingText: { color: colors.textMuted, textAlign: 'center', marginTop: '50%', fontSize: font.base },
    overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' },
    topBar: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: spacing['4xl'] + spacing.sm, paddingHorizontal: spacing.base,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: radius.md,
        backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center',
    },
    topTitle: { fontSize: font.md, fontWeight: '600', color: colors.white },
    scanCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scanArea: { width: SCAN_AREA, height: SCAN_AREA },
    corner: { position: 'absolute', width: 36, height: 36, borderColor: colors.primary, borderWidth: 3 },
    tl: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 10 },
    tr: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 10 },
    bl: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 10 },
    br: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 10 },
    bottom: { alignItems: 'center', paddingBottom: spacing['4xl'], paddingHorizontal: spacing.xl },
    instruction: { fontSize: font.base, color: colors.white, textAlign: 'center', lineHeight: font.base * 1.6, opacity: 0.85 },
    processingText: { fontSize: font.sm, color: colors.primary, marginTop: spacing.md, fontWeight: '500' },
    permissionBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing['2xl'] },
    permIcon: {
        width: 88, height: 88, borderRadius: radius.xl, backgroundColor: colors.bgElevated,
        alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl,
    },
    permTitle: { fontSize: font.lg, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
    permDesc: { fontSize: font.base, color: colors.textSecondary, textAlign: 'center', lineHeight: font.base * 1.6, marginBottom: spacing.xl },
    permBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.lg, marginBottom: spacing.md },
    permBtnText: { fontSize: font.base, fontWeight: '600', color: colors.white },
    backLink: { fontSize: font.sm, color: colors.textMuted, marginTop: spacing.sm },
});
