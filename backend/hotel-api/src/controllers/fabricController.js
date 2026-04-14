const fs = require('fs');
const path = require('path');
const { Gateway, Wallets } = require('fabric-network');

// ¡OJO! Asegúrate de tener este archivo o ajusta el nombre al que uses para la red del hotel
const ccp = require('../config/connection-hotel.json');

// Ruta a los certificados criptográficos del Hotel
const mspBasePath = '/home/brcruz/Zeqium/blockchain/network/crypto-config/peerOrganizations/hotel.zeqium.com/users/Admin@hotel.zeqium.com/msp';

let walletPromise;

async function buildWallet() {
    const wallet = await Wallets.newInMemoryWallet();

    const certDir = path.join(mspBasePath, 'signcerts');
    const keyDir = path.join(mspBasePath, 'keystore');

    const [certFile] = fs.readdirSync(certDir);
    const [keyFile] = fs.readdirSync(keyDir);

    const certificate = fs.readFileSync(path.join(certDir, certFile), 'utf8');
    const privateKey = fs.readFileSync(path.join(keyDir, keyFile), 'utf8');

    const identity = {
        credentials: {
            certificate,
            privateKey,
        },
        mspId: 'HotelMSP', // ¡Cambio crítico! Ahora operamos como Hotel
        type: 'X.509',
    };

    await wallet.put('Admin', identity);
    return wallet;
}

function getWallet() {
    if (!walletPromise) {
        walletPromise = buildWallet();
    }
    return walletPromise;
}

async function getContract() {
    const wallet = await getWallet();
    const gateway = new Gateway();

    await gateway.connect(ccp, {
        wallet,
        identity: 'Admin',
        discovery: { enabled: true, asLocalhost: false },
    });

    const network = await gateway.getNetwork('zeqium-channel');
    const contract = network.getContract('zeqium');

    return { gateway, contract };
}

async function submitTransaction(functionName, ...args) {
    const { gateway, contract } = await getContract();
    try {
        const result = await contract.submitTransaction(functionName, ...args);
        return result ? result.toString() : null;
    } finally {
        gateway.disconnect();
    }
}

async function evaluateTransaction(functionName, ...args) {
    const { gateway, contract } = await getContract();
    try {
        const result = await contract.evaluateTransaction(functionName, ...args);
        const data = result ? result.toString() : null;
        try {
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return data;
        }
    } finally {
        gateway.disconnect();
    }
}

module.exports = { submitTransaction, evaluateTransaction };