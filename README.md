# Hostinger Deployment

This project is a `TanStack Start` SSR app, so it should be deployed on Hostinger as a `Node.js` application, not as plain static hosting.

## Required settings

- Node.js version: `22` preferred, `20+` acceptable
- Install command: `npm install`
- Build command: `npm run build`
- Start command: `npm run start`

## What the start command does

Production server runs with `srvx`, which serves `dist/client` and forwards app requests to the SSR server bundle:

```bash
srvx --prod -s dist/client dist/server/server.js
```

These files are created after `npm run build`.

## Environment variables

Hostinger usually provides `PORT` automatically. `srvx` will use it.

If needed, you can also set:

```env
HOST=0.0.0.0
PORT=3000
NODE_ENV=production
```

## Deploy steps

1. Push this project to GitHub.
2. In Hostinger, create a `Node.js` app and connect the GitHub repo.
3. Set the commands shown above:
   - Install: `npm install`
   - Build: `npm run build`
   - Start: `npm run start`
4. Redeploy the app.

## Important note

If you use normal shared hosting without Node.js app support, this SSR project will not run correctly there. In that case, it would need to be converted to a static app first.
