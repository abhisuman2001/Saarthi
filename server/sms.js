const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE;

const client = twilio(accountSid, authToken);

function sendSMS(to, body) {
  return client.messages.create({
    body,
    from: twilioPhone,
    to,
  });
}

module.exports = { sendSMS };