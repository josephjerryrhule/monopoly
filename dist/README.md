# Monopoly Empire - GitHub Pages Deployment

This directory contains the built client files for GitHub Pages deployment.

## Configuration

The client is configured to connect to a WebSocket server. By default, it tries to connect to `ws://localhost:3000`.

### Setting Server URL

1. **Option 1**: Edit `config.js` and change the `MONOPOLY_SERVER_URL` value
2. **Option 2**: Set `window.MONOPOLY_SERVER_URL` before the page loads

### Deploying the Server

You can deploy the server (from the root directory) to platforms like:

- **Heroku**: 
  ```bash
  git subtree push --prefix=. heroku main
  ```

- **Railway**: Connect your GitHub repo and deploy

- **Render**: Connect your GitHub repo and deploy

### Local Development

To test locally with the built client:

1. Serve this directory with a static server
2. Run the main server on port 3000
3. Open the static site in your browser

The client will connect to the local server automatically.
