const { createClient } = require('redis');

// Si existe la variable de entorno (Docker), la usa. Si no, usa localhost (Desarrollo local)
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const client = createClient({
    url: redisUrl
});

client.on('error', (err) => console.error('❌ Redis Error:', err));

async function connectRedis() {
    if (!client.isOpen) await client.connect();
}

async function saveNonce(nonce, seconds = 60) {
    await connectRedis();
    await client.set(nonce, 'active', { EX: seconds });
}

async function verifyAndBurnNonce(nonce) {
    await connectRedis();
    const exists = await client.get(nonce);
    if (exists) {
        await client.del(nonce);
        return true;
    }
    return false;
}

module.exports = { saveNonce, verifyAndBurnNonce };