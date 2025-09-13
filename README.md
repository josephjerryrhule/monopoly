# Monopoly Empire - Multiplayer

A real-time multiplayer version of the Monopoly Empire digital banker game.

## Features

- **Real-time Multiplayer**: Up to 6 players can join a game room
- **Room-based System**: Create or join games using 6-character room codes
- **Live Synchronization**: All game actions are immediately visible to all players
- **Admin Controls**: Room creator can start the game
- **Disconnection Handling**: Games continue even if players disconnect
- **Responsive Design**: Works on desktop and mobile devices
- **GitHub Pages Support**: Client can be hosted on GitHub Pages while server runs separately

## Deployment Options

### Option 1: Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser and navigate to `http://localhost:3000`

### Option 2: GitHub Pages + Separate Server (Recommended for Production)

This setup allows users to play directly from GitHub Pages while the server runs on a separate platform.

#### Step 1: Deploy the Client to GitHub Pages

1. GitHub Pages is automatically set up via GitHub Actions when you push to the main branch
2. The client will be available at `https://[username].github.io/[repository-name]`

#### Step 2: Deploy the Server

Deploy the server to any Node.js hosting platform:

**Heroku:**
```bash
# Install Heroku CLI, then:
heroku create your-monopoly-server
git push heroku main
```

**Railway:**
```bash
# Connect your GitHub repo to Railway and deploy
```

**Render:**
```bash
# Connect your GitHub repo to Render and deploy
```

#### Step 3: Configure Client to Connect to Server

1. After deploying your server, update `dist/config.js`:
```javascript
window.MONOPOLY_SERVER_URL = 'https://your-server-url.herokuapp.com';
```

2. Or users can set the server URL directly:
```javascript
// Add this before the page loads
window.MONOPOLY_SERVER_URL = 'https://your-server-url.herokuapp.com';
```

### Option 3: Self-hosted

1. Build the client for production:
```bash
npm run build:pages
```

2. Serve the `dist` folder with any static file server
3. Run the server separately (see server deployment options above)

## Development

### Building for GitHub Pages

```bash
npm run build:pages
```

This creates a production build in the `dist` folder that can connect to external servers.

### Server Configuration

The server accepts the following environment variables:

- `PORT`: Server port (default: 3000)

### Client Configuration

The client can be configured by setting `window.MONOPOLY_SERVER_URL` before the page loads.

## How to Play

1. **Create a Room**: Enter your player name and click "Create Room"
2. **Share Room Code**: Share the 6-character room code with other players
3. **Wait for Players**: Other players can join using the room code
4. **Start Game**: Room creator clicks "Start Game" when ready
5. **Play**: Take turns managing your Monopoly Empire!

## Game Actions

- **Buy Brand**: Purchase available brands to build your empire
- **Pay Rent**: Pay rent when landing on other players' brands
- **Bank Transactions**: Pay or receive money from the bank
- **Empire Events**: Handle random empire events
- **Chance Events**: Draw chance cards with various effects
- **Pass Go**: Collect money when passing Go
- **Jail**: Pay fines to get out of jail
- **End Turn**: Pass your turn to the next player

## Technical Details

- **Frontend**: HTML, CSS (Tailwind), JavaScript
- **Backend**: Node.js, Express, Socket.IO
- **Real-time Communication**: WebSocket via Socket.IO
- **Deployment**: GitHub Pages (client) + Node.js hosting (server)