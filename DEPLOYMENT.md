# Deployment Instructions for Saarthi

## Frontend (Vite + React)

### 1. Environment Variables
- Create a `.env` file in the `ims` directory with:
  ```
  VITE_BACKEND=https://your-backend-url.com
  ```
  Replace with your deployed backend URL.

### 2. Build
- Run:
  ```
  cd ims
  npm install
  npm run build
  ```
- The production build will be in `ims/dist`.

### 3. Deploy
- Deploy the contents of `ims/dist` to your static hosting (Vercel, Netlify, etc.).
- If using Vercel, the included `vercel.json` and `_redirects` handle SPA routing.

---

## Backend (Express + MongoDB)

### 1. Environment Variables
- Create a `.env` file in the `server` directory with:
  ```
  MONGO_URI=your_mongodb_connection_string
  TWILIO_ACCOUNT_SID=your_twilio_sid
  TWILIO_AUTH_TOKEN=your_twilio_token
  TWILIO_PHONE=your_twilio_phone
  CLOUDINARY_CLOUD_NAME=your_cloudinary_name
  CLOUDINARY_API_KEY=your_cloudinary_key
  CLOUDINARY_API_SECRET=your_cloudinary_secret
  PORT=5000
  ```

### 2. Build & Start
- Run:
  ```
  cd server
  npm install
  npm start
  ```
- Ensure your backend is accessible from the frontend (CORS, public IP, etc.).

### 3. Deploy
- Deploy to a Node.js host (Render, Heroku, VPS, etc.).
- Make sure environment variables are set in your host's dashboard.

---

## General Notes
- Update all URLs in `.env` files for production.
- Open necessary ports in your firewall/cloud provider.
- For HTTPS, use a reverse proxy (Nginx, Vercel, etc.).
- Monitor logs for errors after deployment.

---

## Example Production .env Files

### ims/.env
```
VITE_BACKEND=https://api.yourdomain.com
```

### server/.env
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/saarthi
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxxx
TWILIO_PHONE=+1234567890
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
PORT=5000
```
