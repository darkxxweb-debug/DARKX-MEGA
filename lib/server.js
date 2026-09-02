import express from 'express';
import { createServer } from 'http';
import config from '../config.js';
import { requestWebPairingCode, isReadyForPairing } from './webPair.js';
const packageInfo = {
    name: config.botName || 'DARKX-MD',
    version: config.version || '6.0.0',
    description: config.description || 'WhatsApp Bot',
    author: config.author || 'DARKX-MD'
};
const app = express();
app.use(express.json());
const server = createServer(app);
const PORT = config.port || 5000;
app.get('/', (req, res) => {
    const uptimeSeconds = Math.floor(process.uptime());
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = uptimeSeconds % 60;
    const uptimeString = `${hours}h ${minutes}m ${seconds}s`;
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${packageInfo.name.toUpperCase()} Status</title>
        <style>
            :root { --primary: #25d366; --bg: #0f172a; --card-bg: rgba(30, 41, 59, 0.7); }
            body { 
                margin: 0; padding: 0; background: var(--bg); color: white; 
                font-family: 'Inter', system-ui, sans-serif;
                display: flex; justify-content: center; align-items: center; min-height: 100vh;
            }
            .container {
                background: var(--card-bg); backdrop-filter: blur(12px);
                border: 1px solid rgba(255,255,255,0.1); padding: 30px;
                border-radius: 24px; width: 90%; max-width: 400px; text-align: center;
                box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            }
            .status-badge {
                display: inline-flex; align-items: center; background: rgba(37, 211, 102, 0.1);
                color: var(--primary); padding: 5px 15px; border-radius: 50px;
                font-size: 0.8rem; font-weight: bold; margin-bottom: 20px;
            }
            .dot { height: 8px; width: 8px; background: var(--primary); border-radius: 50%; margin-right: 8px; box-shadow: 0 0 10px var(--primary); }
            h1 { margin: 0; font-size: 1.8rem; letter-spacing: 1px; }
            .desc { color: #94a3b8; margin: 10px 0 25px 0; font-size: 0.9rem; }
            .grid { display: grid; gap: 12px; }
            .item { 
                background: rgba(0,0,0,0.2); padding: 12px 18px; border-radius: 12px;
                display: flex; justify-content: space-between; align-items: center;
            }
            .label { color: #64748b; font-size: 0.75rem; text-transform: uppercase; font-weight: 800; }
            .val { font-weight: 600; font-family: monospace; color: #f1f5f9; }
            footer { margin-top: 25px; font-size: 0.7rem; color: #475569; letter-spacing: 1px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="status-badge"><span class="dot"></span> SYSTEM ONLINE</div>
            <h1>${packageInfo.name.toUpperCase()}</h1>
            <p class="desc">${packageInfo.description}</p>
            
            <div class="grid">
                <div class="item"><span class="label">Version</span><span class="val">${packageInfo.version}</span></div>
                <div class="item"><span class="label">Author</span><span class="val">${packageInfo.author}</span></div>
                <div class="item"><span class="label">Uptime</span><span class="val">${uptimeString}</span></div>
            </div>

            <a href="/pair" style="display:block;margin-top:18px;color:var(--primary);text-decoration:none;font-weight:700;font-size:0.85rem;">🔗 Open Pairing Site</a>
            <footer>POWERED BY DARKX-MD</footer>
        </div>
    </body>
    </html>
    `);
});
app.get('/health', (req, res) => {
    const mem = process.memoryUsage();
    res.json({
        status: 'ok',
        uptime: Math.floor(process.uptime()),
        memory: {
            rss: `${Math.round(mem.rss / 1024 / 1024) }MB`,
            heapUsed: `${Math.round(mem.heapUsed / 1024 / 1024) }MB`,
            heapTotal: `${Math.round(mem.heapTotal / 1024 / 1024) }MB`
        },
        version: packageInfo.version,
        bot: packageInfo.name,
        timestamp: new Date().toISOString()
    });
});
app.get('/process', (req, res) => {
    const { send } = req.query;
    if (!send)
        return res.status(400).json({ error: 'Missing send query' });
    res.json({ status: 'Received', data: send });
});
app.get('/chat', (req, res) => {
    const { message, to } = req.query;
    if (!message || !to)
        return res.status(400).json({ error: 'Missing message or to query' });
    res.json({ status: 200, info: 'Message received (integration not implemented)' });
});
app.get('/pair', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DARKX MD | Pairing Site</title>
        <style>
            :root { --primary: #25d366; --bg: #0f172a; --card-bg: rgba(30, 41, 59, 0.7); }
            * { box-sizing: border-box; }
            body {
                margin: 0; padding: 0; background: var(--bg); color: white;
                font-family: 'Inter', system-ui, sans-serif;
                display: flex; justify-content: center; align-items: center; min-height: 100vh;
            }
            .container {
                background: var(--card-bg); backdrop-filter: blur(12px);
                border: 1px solid rgba(255,255,255,0.1); padding: 30px;
                border-radius: 24px; width: 90%; max-width: 420px; text-align: center;
                box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            }
            .status-badge {
                display: inline-flex; align-items: center; background: rgba(37, 211, 102, 0.1);
                color: var(--primary); padding: 5px 15px; border-radius: 50px;
                font-size: 0.8rem; font-weight: bold; margin-bottom: 20px;
            }
            .dot { height: 8px; width: 8px; background: var(--primary); border-radius: 50%; margin-right: 8px; box-shadow: 0 0 10px var(--primary); }
            h1 { margin: 0; font-size: 1.8rem; letter-spacing: 1px; }
            .desc { color: #94a3b8; margin: 10px 0 25px 0; font-size: 0.9rem; }
            input {
                width: 100%; padding: 14px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.15);
                background: rgba(0,0,0,0.25); color: #f1f5f9; font-size: 1rem; margin-bottom: 14px;
                font-family: monospace;
            }
            input::placeholder { color: #64748b; }
            button {
                width: 100%; padding: 14px 16px; border-radius: 12px; border: none;
                background: var(--primary); color: #0f172a; font-weight: 800; font-size: 1rem;
                cursor: pointer; letter-spacing: 0.5px;
            }
            button:disabled { opacity: 0.6; cursor: not-allowed; }
            .result {
                margin-top: 20px; padding: 16px; border-radius: 12px; background: rgba(0,0,0,0.25);
                display: none;
            }
            .result.show { display: block; }
            .code {
                font-family: monospace; font-size: 1.6rem; font-weight: 800; letter-spacing: 3px;
                color: var(--primary); margin: 6px 0;
            }
            .error { color: #f87171; margin-top: 14px; font-size: 0.85rem; display: none; }
            .error.show { display: block; }
            ol { text-align: left; color: #94a3b8; font-size: 0.8rem; padding-left: 20px; }
            footer { margin-top: 22px; font-size: 0.7rem; color: #475569; letter-spacing: 1px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="status-badge"><span class="dot"></span> PAIRING SITE</div>
            <h1>DARKX MD</h1>
            <p class="desc">Enter your WhatsApp number to generate a pairing code.</p>
            <input id="number" type="text" inputmode="numeric" placeholder="e.g. 2557XXXXXXXX (with country code)" />
            <button id="generateBtn" onclick="generateCode()">Generate Pairing Code</button>
            <div class="error" id="errorBox"></div>
            <div class="result" id="resultBox">
                <div style="color:#94a3b8;font-size:0.75rem;text-transform:uppercase;">Your Pairing Code</div>
                <div class="code" id="codeText">----</div>
                <ol>
                    <li>Open WhatsApp &rarr; Settings &rarr; Linked Devices</li>
                    <li>Tap "Link a Device"</li>
                    <li>Tap "Link with phone number instead"</li>
                    <li>Enter the code above</li>
                </ol>
            </div>
            <footer>POWERED BY DARKX MD</footer>
        </div>
        <script>
            async function generateCode() {
                const btn = document.getElementById('generateBtn');
                const errorBox = document.getElementById('errorBox');
                const resultBox = document.getElementById('resultBox');
                const number = document.getElementById('number').value.trim();
                errorBox.classList.remove('show');
                resultBox.classList.remove('show');
                if (!number) {
                    errorBox.textContent = 'Please enter your WhatsApp number.';
                    errorBox.classList.add('show');
                    return;
                }
                btn.disabled = true;
                btn.textContent = 'Generating...';
                try {
                    const res = await fetch('/api/pair-code', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ number })
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || 'Failed to generate code');
                    document.getElementById('codeText').textContent = data.code;
                    resultBox.classList.add('show');
                }
                catch (err) {
                    errorBox.textContent = err.message;
                    errorBox.classList.add('show');
                }
                finally {
                    btn.disabled = false;
                    btn.textContent = 'Generate Pairing Code';
                }
            }
        </script>
    </body>
    </html>
    `);
});

app.post('/api/pair-code', async (req, res) => {
    const { number } = req.body || {};
    if (!number) {
        return res.status(400).json({ error: 'Missing WhatsApp number.' });
    }
    if (!isReadyForPairing()) {
        return res.status(503).json({ error: 'Bot is not ready for pairing yet. Please wait a moment and retry.' });
    }
    try {
        const { code } = await requestWebPairingCode(number);
        res.json({ code });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export { app, server, PORT };
