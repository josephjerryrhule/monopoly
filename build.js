const fs = require('fs');
const path = require('path');

// Create dist directory
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

// Read the original index.html
const originalHtml = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');

// Replace socket.io initialization to support external server
const modifiedHtml = originalHtml.replace(
    'this.socket = io();',
    `// Get server URL from environment or default to current origin
        const SERVER_URL = window.MONOPOLY_SERVER_URL || window.location.origin;
        this.socket = io(SERVER_URL, {
            transports: ['websocket', 'polling'],
            timeout: 20000,
            forceNew: true
        });`
);

// Add configuration script reference at the beginning of the body
const configScript = `
<script src="config.js"></script>
<script>
    // Check if we're on GitHub Pages and show connection instructions
    if (window.location.hostname.includes('github.io')) {
        console.log('Running on GitHub Pages. Make sure to set MONOPOLY_SERVER_URL to your deployed server.');
        
        // Show connection notice
        document.addEventListener('DOMContentLoaded', function() {
            const notice = document.createElement('div');
            notice.className = 'bg-yellow-600 text-black p-3 text-center text-sm';
            notice.innerHTML = \`
                <strong>GitHub Pages Deployment:</strong> 
                This client needs to connect to a separate server. 
                Configure your server URL in config.js or deploy the server separately.
            \`;
            document.body.insertBefore(notice, document.body.firstChild);
        });
    }
</script>
`;

// Insert the config script after the opening body tag
const finalHtml = modifiedHtml.replace(
    '<body class="bg-gray-900 text-gray-100">',
    `<body class="bg-gray-900 text-gray-100">\n${configScript}`
);

// Write the modified HTML to dist directory
fs.writeFileSync(path.join(distDir, 'index.html'), finalHtml);

// Create a configuration file for easy server URL updates
const configJs = `// Monopoly Empire Server Configuration
// Set the server URL where your Monopoly Empire server is deployed
// Examples:
// - Heroku: https://your-app.herokuapp.com
// - Railway: https://your-app.railway.app
// - Local development: http://localhost:3000

window.MONOPOLY_SERVER_URL = 'http://localhost:3000';

// To use a different server, change the URL above or set it before loading the page:
// window.MONOPOLY_SERVER_URL = 'https://your-server.herokuapp.com';
`;

fs.writeFileSync(path.join(distDir, 'config.js'), configJs);

// Create a README for the dist directory
const readmeContent = `# Monopoly Empire - GitHub Pages Deployment

This directory contains the built client files for GitHub Pages deployment.

## Configuration

The client is configured to connect to a WebSocket server. By default, it tries to connect to \`ws://localhost:3000\`.

### Setting Server URL

1. **Option 1**: Edit \`config.js\` and change the \`MONOPOLY_SERVER_URL\` value
2. **Option 2**: Set \`window.MONOPOLY_SERVER_URL\` before the page loads

### Deploying the Server

You can deploy the server (from the root directory) to platforms like:

- **Heroku**: 
  \`\`\`bash
  git subtree push --prefix=. heroku main
  \`\`\`

- **Railway**: Connect your GitHub repo and deploy

- **Render**: Connect your GitHub repo and deploy

### Local Development

To test locally with the built client:

1. Serve this directory with a static server
2. Run the main server on port 3000
3. Open the static site in your browser

The client will connect to the local server automatically.
`;

fs.writeFileSync(path.join(distDir, 'README.md'), readmeContent);

console.log('✅ Build complete!');
console.log('📁 Built files are in ./dist/');
console.log('🚀 Ready for GitHub Pages deployment');
console.log('⚙️  Configure server URL in dist/config.js or set window.MONOPOLY_SERVER_URL');