const express = require('express');
const app = express();

app.use(express.json());

const usersMemory = {};

const plans = {
    simple: { name: "Modo Simple", price: 0, limit: 15 },
    hacker: { name: "Modo Hacker", price: 5, limit: 100 },
    unlimited: { name: "Modo Sin Límites", price: 15, limit: Infinity },
    admin: { name: "Administrador Xirox", price: 0, limit: Infinity }
};

const ADMIN_CREDENTIALS = {
    user: "Xirox",
    email: "yerandysff@gmail.com",
    pass: "@Yerandys"
};

app.post('/api/register', (req, res) => {
    const { user, email, pass, country } = req.body;

    if (email === ADMIN_CREDENTIALS.email && pass === ADMIN_CREDENTIALS.pass) {
        usersMemory[user] = { plan: 'admin', messagesCount: 0, country, isAdmin: true };
        return res.json({ success: true, isAdmin: true, message: '¡Bienvenido Administrador Xirox!' });
    }

    if (!user || !email || !pass || !country) {
        return res.status(400).json({ success: false, message: 'Faltan datos.' });
    }

    usersMemory[user] = { plan: 'simple', messagesCount: 0, country, isAdmin: false };
    res.json({ success: true, isAdmin: false, message: 'Registro exitoso.' });
});

app.post('/api/chat', (req, res) => {
    const { userId, message } = req.body;
    let user = usersMemory[userId] || { plan: 'simple', messagesCount: 0 };
    const currentPlan = plans[user.plan] || plans.simple;

    if (!user.isAdmin && user.messagesCount >= currentPlan.limit) {
        return res.json({ reply: `⚠️ Límite alcanzado del ${currentPlan.name}. Actualiza con USDT.` });
    }

    if (!user.isAdmin) {
        user.messagesCount++;
        usersMemory[userId] = user;
    }

    let responsePrefix = "IAHAKER [Simple]";
    if (user.plan === 'hacker') responsePrefix = "KALI >$ [MODO HACKER]";
    if (user.plan === 'unlimited') responsePrefix = "INFINITY >$ [SIN LÍMITES]";
    if (user.plan === 'admin') responsePrefix = "🛡️ [PANEL DE CONTROL XIROX]";

    res.json({ reply: `${responsePrefix} > Procesado: "${message}"` });
});

app.post('/api/subscribe', (req, res) => {
    const { planKey } = req.body;
    const selectedPlan = plans[planKey];
    if (!selectedPlan || selectedPlan.price === 0) return res.json({ error: "No válido." });

    res.json({
        planName: selectedPlan.name,
        amount: selectedPlan.price.toFixed(2),
        currency: "USDT",
        wallet: "0x1a893Dab175dBeb8Ea8d3e2115F4ECB2655397aA",
        instruction: `Envía ${selectedPlan.price} USDT (BEP20).`
    });
});

app.post('/api/verify-payment', (req, res) => {
    const { userId, planKey, txHash } = req.body;
    if (plans[planKey] && txHash) {
        if(usersMemory[userId]) {
            usersMemory[userId].plan = planKey;
            usersMemory[userId].messagesCount = 0;
        }
        return res.json({ success: true, message: `¡${plans[planKey].name} activado!` });
    }
    res.status(400).json({ success: false, message: 'No válido.' });
});

module.exports = app;
