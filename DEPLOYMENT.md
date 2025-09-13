# Deployment Guide: GitHub Pages + Server

This guide explains how to deploy Monopoly Empire so users can play from GitHub Pages while connecting to a separately hosted server.

## Architecture

```
GitHub Pages (Static Client) → WebSocket → Your Server (Node.js)
```

- **Client**: Hosted on GitHub Pages (free, static hosting)
- **Server**: Hosted on Heroku/Railway/Render (handles game logic and WebSocket connections)

## Step-by-Step Deployment

### 1. Enable GitHub Pages

1. Go to your repository settings
2. Navigate to "Pages" section
3. Set source to "GitHub Actions"
4. The workflow in `.github/workflows/deploy.yml` will automatically deploy on push to main

### 2. Deploy the Server

Choose one of these platforms to host your Node.js server:

#### Option A: Heroku (Free tier available)

```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create monopoly-empire-server

# Deploy
git push heroku main

# Your server will be at: https://monopoly-empire-server.herokuapp.com
```

#### Option B: Railway

1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Railway will automatically detect Node.js and deploy
4. Note your deployment URL

#### Option C: Render

1. Go to [render.com](https://render.com)
2. Connect your GitHub repository
3. Create a new "Web Service"
4. Render will automatically deploy
5. Note your deployment URL

### 3. Configure Client Connection

After deploying your server, update the client configuration:

#### Method 1: Edit config.js (Recommended)

1. In your repository, edit `dist/config.js`
2. Change the server URL:
```javascript
window.MONOPOLY_SERVER_URL = 'https://your-server-url.herokuapp.com';
```
3. Commit and push to update GitHub Pages

#### Method 2: User-configurable

Users can set the server URL themselves by adding this before the page loads:
```html
<script>
window.MONOPOLY_SERVER_URL = 'https://your-server-url.herokuapp.com';
</script>
```

### 4. Test the Deployment

1. Visit your GitHub Pages URL: `https://[username].github.io/[repository]`
2. Create a room
3. Open the browser console to check WebSocket connection
4. Test with multiple browsers/devices

## Environment Variables for Server

Set these on your hosting platform:

- `PORT`: Will be set automatically by most platforms
- `NODE_ENV`: Set to "production"

## Troubleshooting

### CORS Issues
If you encounter CORS errors, the server is already configured to allow all origins:
```javascript
cors: {
    origin: "*",
    methods: ["GET", "POST"]
}
```

### WebSocket Connection Issues
1. Ensure your server supports WebSocket connections
2. Check that the server URL in config.js is correct
3. Try both `https://` and `wss://` protocols
4. Check browser console for connection errors

### GitHub Pages Not Updating
1. Check the Actions tab for deployment status
2. Ensure the workflow completed successfully
3. Clear browser cache
4. Check that changes were pushed to the main branch

## Security Considerations

1. **No Authentication**: This is a casual game with no user accounts
2. **CORS**: Currently allows all origins for simplicity
3. **Rate Limiting**: Consider adding rate limiting in production
4. **SSL**: Use HTTPS for both client and server in production

## Monitoring

Monitor your server deployment:
- Check server logs for WebSocket connections
- Monitor resource usage
- Set up uptime monitoring for the server URL

## Cost Considerations

- **GitHub Pages**: Free
- **Heroku**: Free tier available, may sleep after 30 minutes of inactivity
- **Railway**: Free tier with usage limits
- **Render**: Free tier with some limitations

For production use with consistent traffic, consider paid hosting tiers.