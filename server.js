const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Game rooms storage
const gameRooms = new Map();

// Generate random room code
function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Game state template
function createGameState() {
    const PLAYER_COLORS = ['#EF4444', '#3B82F6', '#22C55E', '#EAB308', '#A855F7', '#EC4899'];
    const brandsData = [
        { name: "Beats", price: 50, value: 50, color: "#dbeafe" },
        { name: "Nerf", price: 50, value: 50, color: "#dbeafe" },
        { name: "Transformers", price: 100, value: 50, color: "#fca5a5" },
        { name: "Levi's", price: 100, value: 50, color: "#fca5a5" },
        { name: "Polaroid", price: 150, value: 100, color: "#fde68a" },
        { name: "Puma", price: 150, value: 100, color: "#fde68a" },
        { name: "Candy Crush", price: 200, value: 100, color: "#a78bfa" },
        { name: "Food Network", price: 200, value: 100, color: "#a78bfa" },
        { name: "CAT", price: 250, value: 150, color: "#6ee7b7" },
        { name: "Yahoo", price: 250, value: 150, color: "#6ee7b7" },
        { name: "Nickelodeon", price: 300, value: 150, color: "#93c5fd" },
        { name: "Guitar Hero", price: 300, value: 150, color: "#93c5fd" },
        { name: "Ford", price: 350, value: 200, color: "#f9a8d4" },
        { name: "eBay", price: 350, value: 200, color: "#f9a8d4" },
        { name: "Universal", price: 400, value: 200, color: "#fca5a5" },
        { name: "Heinz", price: 400, value: 200, color: "#fca5a5" },
        { name: "Intel", price: 450, value: 250, color: "#fde68a" },
        { name: "Skype", price: 450, value: 250, color: "#fde68a" },
        { name: "Virgin", price: 500, value: 300, color: "#a78bfa" },
        { name: "Wilson", price: 500, value: 300, color: "#a78bfa" },
        { name: "Coca-Cola", price: 500, value: 350, color: "#6ee7b7" },
        { name: "Xbox", price: 500, value: 350, color: "#6ee7b7" }
    ];

    return {
        roomCode: '',
        players: [],
        brands: brandsData.map((brand, index) => ({
            ...brand, id: index + 1, ownerId: null
        })),
        currentPlayerId: null,
        gameInProgress: false,
        adminId: null,
        playerColors: PLAYER_COLORS
    };
}

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Create a new game room
    socket.on('create-room', (playerName) => {
        const roomCode = generateRoomCode();
        const gameState = createGameState();
        gameState.roomCode = roomCode;
        gameState.adminId = socket.id;
        
        // Add admin as first player
        gameState.players.push({
            id: socket.id,
            name: playerName,
            balance: 1000,
            color: gameState.playerColors[0],
            towerValue: 0,
            bankrupt: false,
            inJail: false,
            isAdmin: true,
            connected: true
        });

        gameRooms.set(roomCode, gameState);
        socket.join(roomCode);
        socket.roomCode = roomCode;

        socket.emit('room-created', { roomCode, gameState });
        console.log(`Room ${roomCode} created by ${playerName}`);
    });

    // Join an existing room
    socket.on('join-room', (data) => {
        const { roomCode, playerName } = data;
        const gameState = gameRooms.get(roomCode);

        if (!gameState) {
            socket.emit('error', { message: 'Room not found' });
            return;
        }

        if (gameState.gameInProgress) {
            socket.emit('error', { message: 'Game already in progress' });
            return;
        }

        if (gameState.players.length >= 6) {
            socket.emit('error', { message: 'Room is full' });
            return;
        }

        // Check if player name already exists
        if (gameState.players.some(p => p.name === playerName)) {
            socket.emit('error', { message: 'Player name already taken' });
            return;
        }

        // Add player to room
        const playerIndex = gameState.players.length;
        gameState.players.push({
            id: socket.id,
            name: playerName,
            balance: 1000,
            color: gameState.playerColors[playerIndex % gameState.playerColors.length],
            towerValue: 0,
            bankrupt: false,
            inJail: false,
            isAdmin: false,
            connected: true
        });

        socket.join(roomCode);
        socket.roomCode = roomCode;

        // Notify all players in room
        io.to(roomCode).emit('player-joined', { gameState });
        console.log(`${playerName} joined room ${roomCode}`);
    });

    // Start the game (admin only)
    socket.on('start-game', () => {
        const roomCode = socket.roomCode;
        const gameState = gameRooms.get(roomCode);

        if (!gameState || gameState.adminId !== socket.id) {
            socket.emit('error', { message: 'Only admin can start the game' });
            return;
        }

        if (gameState.players.length < 2) {
            socket.emit('error', { message: 'Need at least 2 players to start' });
            return;
        }

        gameState.gameInProgress = true;
        gameState.currentPlayerId = gameState.players[0].id;

        io.to(roomCode).emit('game-started', { gameState });
        console.log(`Game started in room ${roomCode}`);
    });

    // Handle game actions
    socket.on('game-action', (data) => {
        const roomCode = socket.roomCode;
        const gameState = gameRooms.get(roomCode);

        if (!gameState || !gameState.gameInProgress) {
            return;
        }

        // Process the action based on type
        switch (data.type) {
            case 'buy-brand':
                handleBuyBrand(gameState, data, socket.id);
                break;
            case 'pay-rent':
                handlePayRent(gameState, data, socket.id);
                break;
            case 'pass-go':
                handlePassGo(gameState, socket.id);
                break;
            case 'bank-transaction':
                handleBankTransaction(gameState, data, socket.id);
                break;
            case 'empire-event':
                handleEmpireEvent(gameState, data, socket.id);
                break;
            case 'chance-event':
                handleChanceEvent(gameState, data, socket.id);
                break;
            case 'go-to-jail':
                handleGoToJail(gameState, socket.id);
                break;
            case 'pay-jail-fine':
                handlePayJailFine(gameState, socket.id);
                break;
            case 'sneaky-swap':
                handleSneakySwap(gameState, data, socket.id);
                break;
            case 'sell-brand':
                handleSellBrand(gameState, data, socket.id);
                break;
            case 'declare-bankruptcy':
                handleDeclareBankruptcy(gameState, socket.id);
                break;
            case 'end-turn':
                handleEndTurn(gameState, socket.id);
                break;
        }

        // Broadcast updated game state
        io.to(roomCode).emit('game-updated', { gameState });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        
        const roomCode = socket.roomCode;
        if (roomCode && gameRooms.has(roomCode)) {
            const gameState = gameRooms.get(roomCode);
            const player = gameState.players.find(p => p.id === socket.id);
            
            if (player) {
                player.connected = false;
                
                // If admin disconnects and game hasn't started, remove room
                if (gameState.adminId === socket.id && !gameState.gameInProgress) {
                    gameRooms.delete(roomCode);
                    io.to(roomCode).emit('room-closed');
                } else {
                    io.to(roomCode).emit('player-disconnected', { playerId: socket.id, gameState });
                }
            }
        }
    });
});

// Game action handlers
function handleBuyBrand(gameState, data, playerId) {
    const player = gameState.players.find(p => p.id === playerId);
    const brand = gameState.brands.find(b => b.id === data.brandId);
    
    if (player && brand && !brand.ownerId && player.balance >= brand.price) {
        player.balance -= brand.price;
        player.towerValue += brand.value;
        brand.ownerId = player.id;
    }
}

function handlePayRent(gameState, data, playerId) {
    const player = gameState.players.find(p => p.id === playerId);
    const owner = gameState.players.find(p => p.id === data.ownerId);
    
    if (player && owner) {
        const rentAmount = data.rentAmount;
        player.balance -= rentAmount;
        owner.balance += rentAmount;
    }
}

function handlePassGo(gameState, playerId) {
    const player = gameState.players.find(p => p.id === playerId);
    if (player) {
        player.balance += 100; // Pass Go amount
    }
}

function handleBankTransaction(gameState, data, playerId) {
    const player = gameState.players.find(p => p.id === playerId);
    if (player) {
        if (data.action === 'pay') {
            player.balance -= data.amount;
        } else if (data.action === 'receive') {
            player.balance += data.amount;
        }
    }
}

function handleEmpireEvent(gameState, data, playerId) {
    // Apply empire event effect based on data.eventType
    const player = gameState.players.find(p => p.id === playerId);
    if (player && data.effect) {
        applyEventEffect(gameState, player, data.effect);
    }
}

function handleChanceEvent(gameState, data, playerId) {
    // Apply chance event effect based on data.eventType
    const player = gameState.players.find(p => p.id === playerId);
    if (player && data.effect) {
        applyEventEffect(gameState, player, data.effect);
    }
}

function handleGoToJail(gameState, playerId) {
    const player = gameState.players.find(p => p.id === playerId);
    if (player) {
        player.inJail = true;
    }
}

function handlePayJailFine(gameState, playerId) {
    const player = gameState.players.find(p => p.id === playerId);
    if (player && player.balance >= 50) {
        player.balance -= 50;
        player.inJail = false;
    }
}

function handleSneakySwap(gameState, data, playerId) {
    const brand1 = gameState.brands.find(b => b.id === data.brand1Id);
    const brand2 = gameState.brands.find(b => b.id === data.brand2Id);
    
    if (brand1 && brand2) {
        const player1 = gameState.players.find(p => p.id === brand1.ownerId);
        const player2 = gameState.players.find(p => p.id === brand2.ownerId);
        
        // Swap owners
        brand1.ownerId = player2.id;
        brand2.ownerId = player1.id;
        
        // Adjust tower values
        player1.towerValue = player1.towerValue - brand1.value + brand2.value;
        player2.towerValue = player2.towerValue - brand2.value + brand1.value;
    }
}

function handleSellBrand(gameState, data, playerId) {
    const player = gameState.players.find(p => p.id === playerId);
    const brand = gameState.brands.find(b => b.id === data.brandId);
    
    if (player && brand && brand.ownerId === player.id) {
        player.balance += brand.price / 2;
        player.towerValue -= brand.value;
        brand.ownerId = null;
    }
}

function handleDeclareBankruptcy(gameState, playerId) {
    const player = gameState.players.find(p => p.id === playerId);
    if (player) {
        player.bankrupt = true;
        // Remove ownership of all brands
        gameState.brands.forEach(brand => {
            if (brand.ownerId === player.id) {
                brand.ownerId = null;
            }
        });
    }
}

function handleEndTurn(gameState, playerId) {
    if (gameState.currentPlayerId === playerId) {
        const activePlayers = gameState.players.filter(p => !p.bankrupt && p.connected);
        const currentIndex = activePlayers.findIndex(p => p.id === playerId);
        const nextIndex = (currentIndex + 1) % activePlayers.length;
        gameState.currentPlayerId = activePlayers[nextIndex].id;
    }
}

function applyEventEffect(gameState, player, effect) {
    // Apply various event effects
    switch (effect.type) {
        case 'balance_change':
            player.balance += effect.amount;
            break;
        case 'tower_value_change':
            player.towerValue += effect.amount;
            break;
        // Add more effect types as needed
    }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});