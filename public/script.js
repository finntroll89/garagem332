// Configuração do WebSocket
const WEBSOCKET_URL = window.location.hostname === 'localhost' 
    ? 'ws://localhost:10000' 
    : 'wss://garagem332.onrender.com'; 

// Inicializar WebSocket
const ws = new WebSocket(WEBSOCKET_URL);
let tableStates = {};

// WebSocket handlers
ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === 'tables') {
        tableStates = message.data;
        updateTableSelectionOptions(); // Atualiza o select de mesas
    }
};

ws.onclose = () => {
    setTimeout(() => {
        window.location.reload();
    }, 1000);
};

// Função para atualizar opções de mesa
function updateTableSelectionOptions() {
    const tableSelect = document.getElementById('tableNumber');
    if (!tableSelect) return;
    
    const currentSelection = tableSelect.value;
    tableSelect.innerHTML = '<option value="">Selecione uma mesa</option>';

    Object.entries(tableStates).forEach(([number, table]) => {
        const option = document.createElement('option');
        option.value = number;
        option.textContent = `Mesa ${number} - ${getTableStatus(table.status)}`;
        option.disabled = table.status !== 'available';
        tableSelect.appendChild(option);
    });

    if (currentSelection && tableStates[currentSelection]?.status === 'available') {
        tableSelect.value = currentSelection;
    }
}

function getTableStatus(status) {
    return {
        'available': 'Disponível',
        'occupied': 'Ocupada',
        'reserved': 'Reservada'
    }[status] || status;
}


function updateTablesDisplay() {
    const tablesGrid = document.getElementById('tablesGrid');
    tablesGrid.innerHTML = '';

    Object.entries(tableStates).forEach(([number, table]) => {
        const tableCard = document.createElement('div');
        tableCard.className = `table-card ${table.status}`;
        tableCard.innerHTML = `
            <h4 class="text-center">Mesa ${number}</h4>
            <p class="text-center mb-3">${getTableStatus(table.status)}</p>
            <select class="form-select" onchange="updateTableStatus(${number}, this.value)">
                <option value="available" ${table.status === 'available' ? 'selected' : ''}>Disponível</option>
                <option value="occupied" ${table.status === 'occupied' ? 'selected' : ''}>Ocupada</option>
                <option value="reserved" ${table.status === 'reserved' ? 'selected' : ''}>Reservada</option>
            </select>
        `;
        tablesGrid.appendChild(tableCard);
    });
}


// Array com os itens do menu
const menuItems = [
    { id: 1, name: 'Corona 290 ml', price: 7.00, image: 'bebidas/corona.jpg', category: 'bebidas' },
    { id: 2, name: 'Corona 350 ml', price: 10.00, image: 'bebidas/corona.jpg', category: 'bebidas' },
    { id: 3, name: 'Bohemia 473 ml ', price: 4.00, image: 'bebidas/bohemia 473ml.jpg', category: 'bebidas' },
    { id: 4, name: 'Back´s', price: 10.00, image: 'bebidas/Backs.jpg', category: 'bebidas' },
    { id: 5, name: 'Patagonia Amber Lager', price: 10.00, image: 'bebidas/Patagonia.webp', category: 'bebidas' },
    { id: 6, name: 'Patagonia Weisser', price: 10.00, image: 'bebidas/Patagonia weisser.jpg', category: 'bebidas' },
    { id: 7, name: 'Budweiser', price: 15.00, image: 'bebidas/budweiser.jpeg', category: 'bebidas' },
    { id: 8, name: 'Bohemia Litrão', price: 12.00, image: 'bebidas/bohemia Litrao.jpg', category: 'bebidas' },
    { id: 9, name: 'Skol Litrão', price: 12.00, image: 'bebidas/skol litrao.jpg', category: 'bebidas' },
    { id: 10, name: 'Antarctica Litrão', price: 12.00, image: 'bebidas/antarctica litrao.jpg', category: 'bebidas' },
    { id: 11, name: 'Cabaré Ice', price: 10.00, image: 'bebidas/cabare ice.jpg', category: 'bebidas' },
    { id: 12, name: 'Copão Vodka Intencion', price: 10.00, image: 'bebidas/copao vodka intencio.jpg', category: 'bebidas' },
    { id: 6, name: 'Copão Gin Rock´s', price: 15.00, image: 'bebidas/copao gin rocks.jpg', category: 'bebidas' },
    { id: 13, name: 'Copão Vodka Jack Daniel´S', price: 15.00, image: 'bebidas/jack deniels.jpg', category: 'bebidas' },
    { id: 14, name: 'Drink´S', price: 20.00, image: 'bebidas/drinks.jpg', category: 'bebidas' },
    { id: 15, name: 'Drink´s Abacaxi', price: 25.00, image: 'bebidas/Drinks Abacaxi.jpeg', category: 'bebidas' },
    { id: 16, name: 'Drink´S De Frutas', price: 8.00, image: 'bebidas/drinks de frutas.jpg', category: 'bebidas' },
    { id: 17, name: 'Camarão', price: 30.00, image: 'tiragosto/camarao.jpeg', category: 'tira-gostos' },
    { id: 18, name: 'Batata Frita', price: 25.00, image: 'tiragosto/batata Frita.jpeg', category: 'tira-gostos' },
    { id: 19, name: 'Frango Frito', price: 25.00, image: 'tiragosto/frangoFrinto.jpeg', category: 'tira-gostos' },
    { id: 20, name: 'Isca de Carne com Batata Frita', price: 25.00, image: 'tiragosto/Isca de Carne com Batata.jpeg', category: 'tira-gostos' },
];

// Carrinho de compras
const cart = [];

// Função para mostrar o modal de seleção de tipo de pedido
function showOrderTypeModal() {
    if (cart.length === 0) {
        return;
    }

    const modal = document.getElementById('orderTypeModal');
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
}

// Função para gerar os itens do menu
function generateMenuItems(category) {
    const menuContainer = document.getElementById('menu-items');
    menuContainer.innerHTML = '';

    menuItems.forEach(item => {
        if (item.category === category) {
            const menuItem = document.createElement('div');
            menuItem.className = 'col-md-4 col-sm-6 mb-4';
            menuItem.innerHTML = `
                <div class="menu-item">
                    <img src="${item.image}" alt="${item.name}" class="img-fluid">
                    <div class="menu-item-info">
                        <h5>${item.name}</h5>
                        <p>R$ ${item.price.toFixed(2)}</p>
                        <div class="d-flex justify-content-between">
                            <button class="btn btn-custom btn-sm remove-from-cart" data-id="${item.id}">-</button>
                            <span class="item-count" data-id="${item.id}">0</span>
                            <button class="btn btn-custom btn-sm add-to-cart" data-id="${item.id}">+</button>
                        </div>
                    </div>
                </div>
            `;
            menuContainer.appendChild(menuItem);
        }
    });
}

// Função para adicionar um item ao carrinho
function addToCart(itemId) {
    const item = menuItems.find(item => item.id === itemId);
    if (item) {
        const existingItem = cart.find(cartItem => cartItem.id === itemId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...item, quantity: 1 });
        }
        updateCart();
        updateItemCount(itemId);
    }
}

// Função para remover um item do carrinho
function removeFromCart(itemId) {
    const index = cart.findIndex(item => item.id === itemId);
    if (index !== -1) {
        if (cart[index].quantity > 1) {
            cart[index].quantity--;
        } else {
            cart.splice(index, 1);
        }
        updateCart();
        updateItemCount(itemId);
    }
}

// Função para atualizar o carrinho
function updateCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalContainer = document.getElementById('cart-total');
    const whatsappLink = document.getElementById('whatsapp-link');
    const cartCount = document.getElementById('cart-count');

    cartItemsContainer.innerHTML = '';
    cartTotalContainer.innerHTML = '';

    let total = 0;

    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'd-flex justify-content-between align-items-center mb-2';
        cartItem.innerHTML = `
            <span>${item.name} - R$ ${item.price.toFixed(2)} x ${item.quantity}</span>
            <div>
                <button class="btn btn-sm btn-danger remove-cart-item" data-id="${item.id}">-</button>
                <button class="btn btn-sm btn-success add-cart-item" data-id="${item.id}">+</button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);
        total += item.price * item.quantity;
    });

    cartTotalContainer.innerHTML = `<strong>Total: R$ ${total.toFixed(2)}</strong>`;
    
    whatsappLink.removeAttribute('href');
    if (cart.length === 0) {
        whatsappLink.classList.add('disabled');
        whatsappLink.style.pointerEvents = 'none';
        whatsappLink.style.opacity = '0.5';
        whatsappLink.onclick = function(e) {
            e.preventDefault();
            return false;
        };
    } else {
        whatsappLink.classList.remove('disabled');
        whatsappLink.style.pointerEvents = 'auto';
        whatsappLink.style.opacity = '1';
        whatsappLink.onclick = function(e) {
            e.preventDefault();
            showOrderTypeModal();
            return false;
        };
    }

    cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
}

// Função para atualizar a contagem de itens
function updateItemCount(itemId) {
    const itemCount = cart.reduce((total, item) => item.id === itemId ? total + item.quantity : total, 0);
    const itemCountElement = document.querySelector(`.item-count[data-id="${itemId}"]`);
    if (itemCountElement) {
        itemCountElement.textContent = itemCount;
    }
}

// Função para enviar mensagem pelo WhatsApp
function sendWhatsAppMessage(orderInfo) {
    let whatsappMessage = 'Olá, gostaria de fazer o seguinte pedido:\n\n';
    cart.forEach(item => {
        whatsappMessage += `- ${item.name}: R$ ${item.price.toFixed(2)} x ${item.quantity}\n`;
    });
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    whatsappMessage += `\nTotal: R$ ${total.toFixed(2)}`;
    whatsappMessage += orderInfo;

    const whatsappNumber = '5592984205512';
    window.location.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
}

// Event Listeners
document.addEventListener('click', function (event) {
    if (event.target.classList.contains('add-to-cart')) {
        const itemId = parseInt(event.target.getAttribute('data-id'));
        addToCart(itemId);
    } else if (event.target.classList.contains('remove-from-cart')) {
        const itemId = parseInt(event.target.getAttribute('data-id'));
        removeFromCart(itemId);
    } else if (event.target.classList.contains('add-cart-item')) {
        const itemId = parseInt(event.target.getAttribute('data-id'));
        addToCart(itemId);
    } else if (event.target.classList.contains('remove-cart-item')) {
        const itemId = parseInt(event.target.getAttribute('data-id'));
        removeFromCart(itemId);
    }
});

// Inicialização e configuração dos listeners
document.addEventListener('DOMContentLoaded', function () {
    generateMenuItems('bebidas');

    const orderTypeSelect = document.getElementById('orderType');
    const tableSelection = document.getElementById('tableSelection');
    const deliveryAddress = document.getElementById('deliveryAddress');
    const confirmOrderBtn = document.getElementById('confirmOrder');

    orderTypeSelect.addEventListener('change', function(e) {
        if (e.target.value === 'table') {
            tableSelection.style.display = 'block';
            deliveryAddress.style.display = 'none';
        } else if (e.target.value === 'delivery') {
            tableSelection.style.display = 'none';
            deliveryAddress.style.display = 'block';
        } else {
            tableSelection.style.display = 'none';
            deliveryAddress.style.display = 'none';
        }
    });

    confirmOrderBtn.addEventListener('click', async function() {
        const orderType = orderTypeSelect.value;
        if (!orderType) {
            alert('Por favor, selecione o tipo de pedido.');
            return;
        }
    
        let orderInfo = '';
        if (orderType === 'table') {
            const tableNumber = document.getElementById('tableNumber').value;
            if (!tableNumber) {
                alert('Por favor, selecione uma mesa.');
                return;
            }
    
            // Verificar se a mesa está disponível
            if (tableStates[tableNumber]?.status !== 'available') {
                alert('Desculpe, esta mesa não está mais disponível. Por favor, escolha outra mesa.');
                updateTableSelectionOptions();
                return;
            }
    
            orderInfo = `\nMesa: ${tableNumber}`;
        } else {
            const address = document.getElementById('address').value.trim();
            if (!address) {
                alert('Por favor, digite o endereço de entrega.');
                return;
            }
            orderInfo = `\nEndereço de entrega: ${address}`;
        }
    
        sendWhatsAppMessage(orderInfo);
        bootstrap.Modal.getInstance(document.getElementById('orderTypeModal')).hide();
        
        // Reset form
        orderTypeSelect.value = '';
        document.getElementById('tableNumber').value = '';
        document.getElementById('address').value = '';
        tableSelection.style.display = 'none';
        deliveryAddress.style.display = 'none';
    });
});

// Evento de clique nos botões de categoria
document.getElementById('bebidas-btn').addEventListener('click', function () {
    generateMenuItems('bebidas');
});

document.getElementById('tira-gostos-btn').addEventListener('click', function () {
    generateMenuItems('tira-gostos');
});