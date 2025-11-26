const { Client } = require('whatsapp-web.js');
const fs = require('fs');
const QRCode = require('qrcode');
const express = require('express');

let sessionData;
if (fs.existsSync('./session.json')) {
  sessionData = require('./session.json');
}

const client = new Client({
  session: sessionData,
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: '/snap/bin/chromium'
  }
});

client.on('authenticated', (session) => {
  fs.writeFileSync('./session.json', JSON.stringify(session));
});

client.on('qr', (qr) => {
  QRCode.toFile('qr.png', qr, function (err) {
    if (err) throw err;
    console.log('QR code saved as qr.png');
  });
});

client.on('ready', () => {
  console.log('WhatsApp bot is ready!');
});

client.initialize();

const app = express();
app.use(express.static(__dirname));
app.listen(3000, () => {
  console.log('Scan QR at http://<your-ec2-ip>:3000/qr.png');
});
