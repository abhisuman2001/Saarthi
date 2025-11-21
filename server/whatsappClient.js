const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox'],
    }
});

client.on('ready', () => {
    console.log('WhatsApp Client is ready!');
});

client.on('qr', (qr) => {
    console.log('SCAN THIS QR CODE WITH YOUR PHONE (Linked Devices):');
    qrcode.generate(qr, { small: true });
});

client.initialize();

const sendWhatsAppMessage = async (number, message) => {
    try {
        // Format number: WhatsApp requires country code without '+' (e.g., 919999999999@c.us)
        const sanitized_number = number.toString().replace(/[- )(]/g, "");
        const final_number = sanitized_number.startsWith('91') ? sanitized_number : `91${sanitized_number}`;
        const wa_number = `${final_number}@c.us`;
        const response = await client.sendMessage(wa_number, message);
        console.log("WhatsApp sent successfully");
        return response;
    } catch (error) {
        console.error("Failed to send WhatsApp:", error);
    }
};

module.exports = { sendWhatsAppMessage };
