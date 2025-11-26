FROM node:18-bullseye
RUN apt-get update && apt-get install -y chromium
WORKDIR /app
COPY . .
RUN npm install
ENV PUPPETEER_SKIP_DOWNLOAD=true
CMD ["node", "server/whatsapp-bot.js"]