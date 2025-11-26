const cron = require('node-cron');
const Patient = require('./models/Patient');
const { sendWhatsAppMessage } = require('./whatsappClient');

// Reminder message
const reminderMsg = `This is your daily reminder from ORTHO SAARTHI 🌟\nPlease wear your appliance as prescribed. Consistency is key to your treatment success!`;

// Send reminders to all patients
async function sendReminders() {
  try {
    const patients = await Patient.find({ contactNumber: { $exists: true, $ne: null } });
    for (const patient of patients) {
      await sendWhatsAppMessage(patient.contactNumber, `Hi ${patient.name || 'Patient'},\n${reminderMsg}`);
    }
    console.log('WhatsApp reminders sent to all patients');
  } catch (err) {
    console.error('Error sending reminders:', err);
  }
}

// Schedule for 2PM and 00:10AM
// cron.schedule('10 0 * * *', sendReminders); // 00:10 AM
// cron.schedule('0 14 * * *', sendReminders); // 2:00 PM

module.exports = {};