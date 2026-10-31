const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Memoria temporal para usuarios y planes en la nube
const usersMemory = {};
const historyMemory = {};

const plans = {
    simple: { name: "Modo Simple", price: 0, limit: 15 },
    hacker: { name: "Modo Hacker", price: 5, limit: 100 },
    unlimited: { name: "Modo Sin Límites", price: 15, limit: Infinity }
};

app.post('/api/chat', (req, res) => {
    const { userId, message } = req.body;

    let user = usersMemory[userId] || { plan: 'simple', messagesCount: 0 };
    const currentPlan = plans[user.plan] || plans.simple;

    if (user.messagesCount >= currentPlan.limit) {
        return res.json({ 
            reply: `⚠️ Has alcanzado el límite de mensajes del ${currentPlan.name}. Actualiza tu plan con USDT para continuar.` 
        });
    }

    user.messagesCount++;
    usersMemory[userId] = user;

    let responsePrefix = "IAHAKER [Simple]";
    if (user.plan === 'hacker') responsePrefix = "KALI >$ [MODO HACKER]";
    if (user.plan === 'unlimited') responsePrefix = "INFINITY >$ [SIN LÍMITES]";

    const replyText = `${responsePrefix} > Procesado: "${message}"`;

    if (!historyMemory[userId]) historyMemory[userId] = [];
    historyMemory[userId].push({
        timestamp: new Date().toISOString(),
        prompt: message,
        response: replyText,
        plan: user.plan
    });

    res.json({ reply: replyText });
});

app.post('/api/subscribe', (req, res) => {
    const { planKey } = req.body;
    const selectedPlan = plans[planKey];

    if (!selectedPlan || selectedPlan.price === 0) {
        return res.json({ error: "Plan gratuito o no válido." });
    }

    const myUSDTWallet = "0x1a893Dab175dBeb8Ea8d3e2115F4ECB2655397aA";

    res.json({
        planName: selectedPlan.name,
        amount: selectedPlan.price.toFixed(2),
        currency: "USDT",
        wallet: myUSDTWallet,
        instruction: `Envía exactamente ${selectedPlan.price} USDT (Red BEP20) y reporta el Hash.`
    });
});

app.post('/api/verify-payment', (req, res) => {
    const { userId, planKey, txHash } = req.body;

    if (plans[planKey] && txHash) {
        usersMemory[userId] = { 
            plan: planKey, 
            messagesCount: 0, 
            lastPaymentHash: txHash,
            updatedAt: new Date()
        };

        return res.json({ success: true, message: `¡${plans[planKey].name} activado con éxito!` });
    }
    res.status(400).json({ success: false, message: 'Transacción no válida.' });
});

// Exportar app para Vercel
module.exports = app;

// Si se ejecuta localmente en Termux
if (process.env.NODE_ENV !== 'production') {
    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`Servidor local corriendo en http://localhost:${PORT}`);
    });
}
