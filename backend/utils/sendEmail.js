// backend/utils/sendEmail.js
const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",           // host/port hatao, yeh daalo
    auth: {
      user: process.env.SMTP_USER,     // SMTP_EMAIL → SMTP_USER
      pass: process.env.SMTP_PASS,     // SMTP_PASSWORD → SMTP_PASS
    },
  });

  const message = {
    from:    `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to:      options.email,
    subject: options.subject,
    text:    options.message,
  };

  await transporter.sendMail(message);
};

module.exports = sendEmail;