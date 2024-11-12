// Configuração do WebSocket
const WEBSOCKET_URL = window.location.hostname === 'localhost'
    ? 'ws://localhost:10000'
    : 'wss://garagem332.onrender.com';

const ws = initializeWebSocket(WEBSOCKET_URL);
let tableStates = {};

// Função para inicializar o WebSocket
function initializeWebSocket(url) {
    const websocket = new WebSocket(url);

    websocket.onmessage = handleWebSocketMessage;
    websocket.onclose = handleWebSocketClose;

    return websocket;
}

// Manipulador de mensagens WebSocket
function handleWebSocketMessage(event) {
    const message = JSON.parse(event.data);
    if (message.type === 'tables') {
        tableStates = message.data;
        updateTableSelectionOptions();
    }
}

// Manipulador para reconexão em caso de desconexão
function handleWebSocketClose() {
    console.error('Conexão WebSocket perdida. Tentando reconectar...');
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

// Atualiza as opções de mesa no select
function updateTableSelectionOptions() {
    const tableSelect = document.getElementById('tableNumber');
    if (!tableSelect) return;

    const currentSelection = tableSelect.value;
    tableSelect.innerHTML = '<option value="">Selecione uma mesa</option>';

    Object.entries(tableStates).forEach(([number, table]) => {
        const option = createTableOption(number, table);
        tableSelect.appendChild(option);
    });

    // Se a seleção atual for válida, mantém a mesa selecionada
    if (currentSelection && tableStates[currentSelection]?.status === 'available') {
        tableSelect.value = currentSelection;
    }
}

// Cria uma opção para o select de mesas
function createTableOption(number, table) {
    const option = document.createElement('option');
    option.value = number;
    option.textContent = `Mesa ${number} - ${getTableStatus(table.status)}`;
    option.disabled = table.status !== 'available';
    return option;
}

// Retorna o status da mesa formatado
function getTableStatus(status) {
    const statusMap = {
        available: 'Disponível',
        occupied: 'Ocupada',
        reserved: 'Reservada',
    };
    return statusMap[status] || status;
}

// Evento ao confirmar pedido
document.getElementById('confirmOrder').addEventListener('click', handleConfirmOrder);

// Manipulador para confirmar pedido
async function handleConfirmOrder() {
    const orderType = document.getElementById('orderType').value;
    if (orderType !== 'table') return;

    const tableNumber = document.getElementById('tableNumber').value;
    if (!tableNumber) {
        alert('Por favor, selecione uma mesa.');
        return;
    }

    try {
        const success = await updateTableStatus(tableNumber, 'occupied');
        if (success) {
            alert(`Pedido confirmado para a Mesa ${tableNumber}`);
        } else {
            alert('Erro ao confirmar pedido. Tente novamente.');
        }
    } catch (error) {
        console.error('Erro ao atualizar status da mesa:', error);
    }
}

// Atualiza o status da mesa via API
async function updateTableStatus(tableNumber, status) {
    const response = await fetch(`/api/tables/${tableNumber}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
    });
    return response.ok;
}
