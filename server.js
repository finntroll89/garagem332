// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Configurações
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'garagem332';

// Middleware
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Estado das mesas
let tables = {
    1: { status: 'available' },
    2: { status: 'available' },
    3: { status: 'available' },
    4: { status: 'available' },
    5: { status: 'available' },
    6: { status: 'available' },
    7: { status: 'available' }
};

// Rotas da API
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false });
    }
});

app.get('/api/tables', (req, res) => {
    res.json(tables);
});

app.get('/api/tables/:number', (req, res) => {
    const { number } = req.params;
    if (tables[number]) {
        res.json({ status: tables[number].status });
    } else {
        res.status(404).json({ message: 'Mesa não encontrada' });
    }
});

// Rota para todas as outras requisições
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// WebSocket
function broadcastTableUpdate() {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'tables',
                data: tables
            }));
        }
    });
}

wss.on('connection', (ws) => {
    console.log('Novo cliente conectado');
    
    ws.send(JSON.stringify({
        type: 'tables',
        data: tables
    }));

    ws.on('message', (message) => {
        try {
            const { type, data, auth } = JSON.parse(message);

            if (type === 'updateTable' && auth?.username === ADMIN_USER && auth?.password === ADMIN_PASS) {
                const { tableNumber, status } = data;
                if (tables[tableNumber]) {
                    tables[tableNumber].status = status;
                    broadcastTableUpdate();
                }
            }
        } catch (error) {
            console.error('Erro ao processar mensagem:', error);
        }
    });

    ws.on('close', () => {
        console.log('Cliente desconectado');
    });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});