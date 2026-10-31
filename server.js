const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

// Crear la carpeta de base de datos si no existe
const DB_DIR = path.join(__dirname, 'database');
if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
}

const USERS_FILE = path.join(DB_DIR, 'users.json');
const HISTORY_FILE = path.join(DB_DIR, 'history.json');

function loadData(filePath) {
    if (!fs.existsSync(filePath)) return {};
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
        return {};
    }
}

function saveData(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Definición de planes, límites y precios en USDT
const plans = {
    simple: { name: "Modo Simple", price: 0, limit: 15 },
    hacker: { name: "Modo Hacker", price: 5, limit: 100 },
    unlimited: { name: "Modo Sin Límites", price: 15, limit: Infinity }
};

// Endpoint del chat con persistencia en Base de Datos
app.post('/api/chat', (req, res) => {
    const { userId, message } = req.body;
    const users = loadData(USERS_FILE);
    const history = loadData(HISTORY_FILE);

    let user = users[userId] || { plan: 'simple', messagesCount: 0, createdAt: new Date() };
    const currentPlan = plans[user.plan] || plans.simple;

    if (user.messagesCount >= currentPlan.limit) {
        return res.json({ 
            reply: `⚠️ Has alcanzado el límite de mensajes del ${currentPlan.name}. Actualiza tu plan con USDT para continuar.` 
        });
    }

    user.messagesCount++;
    users[userId] = user;
    saveData(USERS_FILE, users);

    let responsePrefix = "IAHAKER [Simple]";
    if (user.plan === 'hacker') responsePrefix = "KALI >$ [MODO HACKER ACTIVADO]";
    if (user.plan === 'unlimited') responsePrefix = "INFINITY >$ [SIN LÍMITES]";

    const replyText = `${responsePrefix} > Procesado: "${message}"`;

    if (!history[userId]) history[userId] = [];
    history[userId].push({
        timestamp: new Date().toISOString(),
        prompt: message,
        response: replyText,
        plan: user.plan
    });
    saveData(HISTORY_FILE, history);

    res.json({ reply: replyText });
});

// Endpoint para solicitar los datos de pago con tu wallet BEP20
app.post('/api/subscribe', (req, res) => {
    const { planKey } = req.body;
    const selectedPlan = plans[planKey];

    if (!selectedPlan || selectedPlan.price === 0) {
        return res.json({ error: "Plan gratuito o no válido." });
    }

    // Tu wallet BEP20 configurada
    const myUSDTWallet = "0x1a893Dab175dBeb8Ea8d3e2115F4ECB2655397aA";

    res.json({
        planName: selectedPlan.name,
        amount: selectedPlan.price.toFixed(2),
        currency: "USDT",
        wallet: myUSDTWallet,
        instruction: `Envía exactamente ${selectedPlan.price} USDT (Red BEP20) y reporta el Hash.`
    });
});

// Endpoint para verificar pago y actualizar el plan en la BD
app.post('/api/verify-payment', (req, res) => {
    const { userId, planKey, txHash } = req.body;
    const users = loadData(USERS_FILE);

    if (plans[planKey] && txHash) {
        users[userId] = { 
            plan: planKey, 
            messagesCount: 0, 
            lastPaymentHash: txHash,
            updatedAt: new Date()
        };
        saveData(USERS_FILE, users);

        return res.json({ success: true, message: `¡${plans[planKey].name} activado con éxito!` });
    }
    res.status(400).json({ success: false, message: 'Transacción no válida.' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n========================================`);
    console.log(` Servidor IAHAKER Activo con Wallet BEP20`);
    console.log(` Wallet: 0x1a893Dab175dBeb8Ea8d3e2115F4ECB2655397aA`);
    console.log(` Servidor: http://localhost:${PORT}`);
    console.log(`========================================\n`);
});
