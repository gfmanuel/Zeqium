const fs = require('fs');
const path = require('path');
const { Gateway, Wallets } = require('fabric-network');

// Connection profile for Org1 (Policía)
const ccp = require('../config/connection-police.json');


const mspBasePath = '/home/mgf00042/Zeqium/blockchain/network/crypto-config/peerOrganizations/policia.zeqium.com/users/Admin@policia.zeqium.com/msp';


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
    mspId: 'PoliciaMSP',
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
    discovery: { enabled: false, asLocalhost: true },
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

module.exports = {
  submitTransaction,
  evaluateTransaction,
};

