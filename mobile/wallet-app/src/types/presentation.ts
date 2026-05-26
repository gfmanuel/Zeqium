export interface RequestedClaim {
    key: string;
    label: string;
    required: boolean;
}

export interface PresentationRequestBody {
    goal_code: string;
    nonce: string;
    requirements: { schema: string; constraints?: unknown }[];
}

export interface QRPayload {
    type: 'zeqium:presentation-request';
    v: number;
    checkinPath: string;
    request: {
        type: string;
        id?: string;
        from?: string;
        body: PresentationRequestBody;
    };
    requestedClaims: RequestedClaim[];
    hotelPublicKey: Record<string, string>;
    hotelDid: string;
}

export interface CheckinResult {
    success: boolean;
    message?: string;
    error?: string;
    user_checked_in?: {
        nombre: string;
        habitacion: string;
        did: string;
    };
    auditId?: string;
}
