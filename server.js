// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const path = require('path');

// Configurações
const CONFIG = {
    port: process.env.PORT || 10000,
    auth: {
        user: process.env.ADMIN_USER || 'admin',
        pass: process.env.ADMIN_PASS || 'garagem332'
    },
    cors: {
        origin: ['http://localhost:3000', 'https://garagem332.onrender.com'],
        methods: ['GET', 'POST']
    }
};

// Estado inicial das mesas
const initialTables = {
    1: { status: 'available' },
    2: { status: 'available' },
    3: { status: 'available' },
    4: { status: 'available' },
    5: { status: 'available' },
    6: { status: 'available' },
    7: { status: 'available' }
};

// Gerenciador de Mesas
class TableManager {
    constructor() {
        this.tables = {...initialTables};
    }

    getTable(number) {
        return this.tables[number];
    }

    getAllTables() {
        return this.tables;
    }

    updateTable(number, status) {
        if (this.tables[number]) {
            this.tables[number].status = status;
            return true;
        }
        return false;
    }

    isValidStatus(status) {
        return ['available', 'occupied', 'reserved'].includes(status);
    }
}

// Inicialização do servidor
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const tableManager = new TableManager();

// Middleware
app.use(cors(CONFIG.cors));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware de log
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Autenticação
function authenticate(username, password) {
    return username === CONFIG.auth.user && password === CONFIG.auth.pass;
}

// Rotas da API
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    if (authenticate(username, password)) {
        res.json({ success: true });
    } else {
        console.warn(`Tentativa de login falha para usuário: ${username}`);
        res.status(401).json({ success: false });
    }
});

app.get('/api/tables', (req, res) => {
    res.json(tableManager.getAllTables());
});

app.get('/api/tables/:number', (req, res) => {
    const table = tableManager.getTable(req.params.number);
    
    if (table) {
        res.json({ status: table.status });
    } else {
        res.status(404).json({ message: 'Mesa não encontrada' });
    }
});

// Rota padrão para SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// WebSocket
function broadcastTableUpdate() {
    const data = JSON.stringify({
        type: 'tables',
        data: tableManager.getAllTables()
    });

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

wss.on('connection', (ws, req) => {
    console.log(`Nova conexão WebSocket - ${new Date().toISOString()}`);
    
    // Envia estado inicial
    ws.send(JSON.stringify({
        type: 'tables',
        data: tableManager.getAllTables()
    }));

    ws.on('message', (message) => {
        try {
            const { type, data, auth } = JSON.parse(message);

            if (type === 'updateTable' && authenticate(auth?.username, auth?.password)) {
                const { tableNumber, status } = data;

                if (!tableManager.isValidStatus(status)) {
                    console.error(`Status inválido recebido: ${status}`);
                    return;
                }

                if (tableManager.updateTable(tableNumber, status)) {
                    console.log(`Mesa ${tableNumber} atualizada para ${status}`);
                    broadcastTableUpdate();
                }
            }
        } catch (error) {
            console.error('Erro ao processar mensagem WebSocket:', error);
        }
    });

    ws.on('close', () => {
        console.log(`Conexão WebSocket fechada - ${new Date().toISOString()}`);
    });
});

// Iniciar servidor
server.listen(CONFIG.port, () => {
    console.log(`Servidor rodando na porta ${CONFIG.port}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});