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

// API: Registro
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

// API: Chat
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

// API: Suscripción
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

// API: Verificación de pago
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

// Interfaz Web Completa (IAHAKER.COM) servida directamente
app.get('*', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IAHAKER.COM</title>
    <style>
        body { background-color: #0d0e15; color: #e1e1e6; font-family: monospace; margin: 0; display: flex; flex-direction: column; height: 100vh; }
        header { background: #161822; padding: 15px; text-align: center; border-bottom: 2px solid #7c3aed; font-weight: bold; color: #a78bfa; display: flex; justify-content: space-between; align-items: center; padding-left: 20px; padding-right: 20px;}
        #auth-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(13, 14, 21, 0.95); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .auth-card { background: #161822; border: 1px solid #7c3aed; padding: 25px; border-radius: 10px; width: 320px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 0 20px rgba(124, 58, 237, 0.3); }
        .auth-card h2 { color: #a78bfa; text-align: center; margin-top: 0; }
        .auth-card input, .auth-card select { background: #09090b; border: 1px solid #3f3f46; color: #e1e1e6; padding: 10px; border-radius: 6px; outline: none; font-family: monospace; width: 100%; box-sizing: border-box; }
        .auth-card button { background: #7c3aed; color: white; border: none; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer; width: 100%; }
        #main-container { display: flex; flex: 1; overflow: hidden; display: none; }
        #chat-section { flex: 2; display: flex; flex-direction: column; border-right: 1px solid #27272a; }
        #chat-container { flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 10px; }
        #pricing-section { flex: 1; padding: 20px; background: #12131c; overflow-y: auto; }
        .message { padding: 10px 15px; border-radius: 8px; max-width: 85%; line-height: 1.4; word-break: break-word; }
        .user { background: #7c3aed; color: white; align-self: flex-end; }
        .bot { background: #1f2231; color: #f4f4f5; align-self: flex-start; border: 1px solid #3f3f46; }
        .input-area { display: flex; padding: 10px; background: #161822; border-top: 1px solid #27272a; }
        .input-area input { flex: 1; background: #09090b; border: 1px solid #3f3f46; color: #a78bfa; padding: 10px; border-radius: 6px; outline: none; font-family: monospace; }
        .input-area button { background: #7c3aed; color: white; border: none; padding: 8px 15px; margin-left: 8px; border-radius: 6px; font-weight: bold; cursor: pointer; width: auto; }
        .card { background: #1a1b26; border: 1px solid #3f3f46; padding: 12px; border-radius: 8px; margin-bottom: 12px; }
        .card h3 { color: #a78bfa; margin-top: 0; margin-bottom: 5px; }
        .price { color: #22c55e; font-weight: bold; }
    </style>
</head>
<body>
    <div id="auth-modal">
        <div class="auth-card">
            <h2>IAHAKER.COM</h2>
            <p style="font-size: 11px; text-align: center; color: #a1a1aa; margin-top:0;">Registro Mundial o Admin (Xirox)</p>
            <input type="text" id="regUser" placeholder="Nombre de usuario">
            <input type="email" id="regEmail" placeholder="Correo electrónico">
            <input type="password" id="regPass" placeholder="Contraseña">
            <select id="regCountry">
                <option value="" disabled selected>Selecciona tu país</option>
            </select>
            <button onclick="registerUser()">Acceder al Sistema</button>
        </div>
    </div>

    <header>
        <span id="headerTitle">KALI >$ IAHAKER.COM</span>
        <span id="userStatus" style="font-size: 12px; color: #22c55e;">Modo: Simple</span>
    </header>
    
    <div id="main-container">
        <div id="chat-section">
            <div id="chat-container">
                <div class="message bot">¡Bienvenido a IAHAKER.COM! Sistema activo globalmente.</div>
            </div>
            <div class="input-area">
                <input type="text" id="userInput" placeholder="Escribe un comando..." autofocus>
                <button onclick="sendMessage()">Enviar</button>
            </div>
        </div>

        <div id="pricing-section">
            <div class="card">
                <h3>Sistema Simple</h3>
                <p>• 15 mensajes de prueba</p>
                <p class="price">Gratis (0 USDT)</p>
            </div>
            <div class="card" style="border-color: #3b82f6;">
                <h3>Modo Hacker</h3>
                <p>• 100 mensajes al mes</p>
                <p class="price">5.00 USDT / mes</p>
                <button style="background: #3b82f6; width:100%; border:none; padding:8px; border-radius:6px; color:white; font-weight:bold; cursor:pointer; margin-top:8px;" onclick="requestPlan('hacker')">Adquirir Modo Hacker</button>
            </div>
            <div class="card" style="border-color: #22c55e;">
                <h3>Modo Sin Límites</h3>
                <p>• Uso 100% ilimitado</p>
                <p class="price">15.00 USDT / mes</p>
                <button style="background: #22c55e; width:100%; border:none; padding:8px; border-radius:6px; color:white; font-weight:bold; cursor:pointer; margin-top:8px;" onclick="requestPlan('unlimited')">Adquirir Sin Límites</button>
            </div>
            <div id="paymentBox" class="card" style="display:none; border-color: #7c3aed; background: #161722;">
                <h3 id="paymentTitle">Pago con USDT</h3>
                <p id="walletInfo" style="word-break: break-all; font-size: 11px; background: #09090b; padding: 8px;"></p>
                <input type="text" id="txHashInput" placeholder="Pega el Hash de la transacción" style="width:100%; margin-top:5px; box-sizing: border-box; background:#09090b; border:1px solid #3f3f46; color:#e1e1e6; padding:8px; border-radius:6px;">
                <button style="background:#7c3aed; width:100%; border:none; padding:8px; border-radius:6px; color:white; font-weight:bold; cursor:pointer; margin-top:8px;" onclick="verifyPayment()">Verificar y Activar</button>
            </div>
        </div>
    </div>

    <script>
        let currentUserId = '';
        let activePlanKey = 'simple';
        const countries = ["Afganistán", "Albania", "Alemania", "Andorra", "Angola", "Antigua y Barbuda", "Arabia Saudita", "Argelia", "Argentina", "Armenia", "Australia", "Austria", "Azerbaiyán", "Bahamas", "Bangladés", "Barbados", "Baréin", "Bélgica", "Belice", "Benin", "Bielorrusia", "Bolivia", "Bosnia-Herzegovina", "Botsuana", "Brasil", "Brunéi", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Camboya", "Camerún", "Canadá", "Catar", "Chad", "Chile", "China", "Chipre", "Colombia", "Comoras", "Congo", "Corea del Norte", "Corea del Sur", "Costa de Marfil", "Costa Rica", "Croacia", "Cuba", "Dinamarca", "Ecuador", "Egipto", "El Salvador", "Emiratos Árabes Unidos", "Eritrea", "Eslovaquia", "Eslovenia", "España", "Estados Unidos", "Estonia", "Etiopía", "Filipinas", "Finlandia", "Fiyi", "Francia", "Gabón", "Gambia", "Georgia", "Ghana", "Grecia", "Guatemala", "Guinea", "Haití", "Honduras", "Hungría", "India", "Indonesia", "Irak", "Irán", "Irlanda", "Islandia", "Israel", "Italia", "Jamaica", "Japón", "Jordania", "Kazajistán", "Kenia", "Kuwait", "Laos", "Letonia", "Líbano", "Libia", "Lituania", "Luxemburgo", "Madagascar", "Malasia", "Malawi", "Maldivas", "Malí", "Malta", "Marruecos", "Mauricio", "Mauritania", "México", "Moldavia", "Mónaco", "Mongolia", "Montenegro", "Mozambique", "Namibia", "Nepal", "Nicaragua", "Níger", "Nigeria", "Noruega", "Nueva Zelanda", "Omán", "Países Bajos", "Pakistán", "Palestina", "Panamá", "Paraguay", "Perú", "Polonia", "Portugal", "Reino Unido", "República Checa", "República Dominicana", "Rumanía", "Rusia", "San Marino", "Senegal", "Serbia", "Singapur", "Siria", "Somalia", "Sri Lanka", "Sudáfrica", "Suecia", "Suiza", "Surinam", "Tailandia", "Tanzania", "Tayikistán", "Timor Oriental", "Togo", "Túnez", "Turquía", "Ucrania", "Uganda", "Uruguay", "Uzbekistán", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Yibuti", "Zambia", "Zimbabue"];
        
        const sel = document.getElementById('regCountry');
        countries.forEach(c => { let o = document.createElement('option'); o.value = c; o.innerHTML = c; sel.appendChild(o); });

        async function registerUser() {
            const user = document.getElementById('regUser').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const pass = document.getElementById('regPass').value.trim();
            const country = document.getElementById('regCountry').value;
            if(!user || !email || !pass || !country) return alert('Rellena todos los campos.');

            const res = await fetch('/api/register', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({user, email, pass, country}) });
            const data = await res.json();
            if(data.success) {
                currentUserId = user;
                document.getElementById('auth-modal').style.display = 'none';
                document.getElementById('main-container').style.display = 'flex';
                if(data.isAdmin) {
                    document.getElementById('userStatus').innerText = "🛡️ ADMIN XIROX";
                    document.getElementById('headerTitle').innerText = "🛡️ PANEL XIROX";
                    document.getElementById('pricing-section').innerHTML = '<div class="card" style="border-color:#7c3aed;"><h3>Panel Admin</h3><p>Conectado como <b>Xirox</b></p><p class="price">Acceso Ilimitado</p></div>';
                }
            } else { alert('Error en registro'); }
        }

        async function sendMessage() {
            const input = document.getElementById('userInput');
            const text = input.value.trim();
            if(!text) return;
            const chat = document.getElementById('chat-container');
            chat.innerHTML += `<div class="message user">${text}</div>`;
            input.value = '';
            chat.scrollTop = chat.scrollHeight;

            const res = await fetch('/api/chat', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({userId: currentUserId, message: text}) });
            const data = await res.json();
            chat.innerHTML += `<div class="message bot">${data.reply}</div>`;
            chat.scrollTop = chat.scrollHeight;
        }

        async function requestPlan(planKey) {
            activePlanKey = planKey;
            const res = await fetch('/api/subscribe', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({planKey}) });
            const data = await res.json();
            document.getElementById('paymentBox').style.display = 'block';
            document.getElementById('paymentTitle').innerText = `Pagar ${data.planName} (${data.amount} USDT)`;
            document.getElementById('walletInfo').innerHTML = `Envía <b>${data.amount} USDT</b> (BEP20):<br><b>${data.wallet}</b>`;
        }

        async function verifyPayment() {
            const txHash = document.getElementById('txHashInput').value.trim();
            if(!txHash) return alert('Introduce el Hash.');
            const res = await fetch('/api/verify-payment', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({userId: currentUserId, planKey: activePlanKey, txHash}) });
            const data = await res.json();
            if(data.success) { alert(data.message); document.getElementById('paymentBox').style.display = 'none'; } else { alert('Falló'); }
        }
    </script>
</body>
</html>`);
});

module.exports = app;
