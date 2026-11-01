import nodemailer from 'nodemailer';
import config from '../Config/config.js';

// Setup Nodemailer transporter with Gmail App Password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.GOOGLE_USER,
    pass: config.EMAIL_APP_PASSWORD,
  },
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error.message || error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

export default transporter;

// Function to send email
export const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Authentication" <${config.GOOGLE_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log('Email sent successfully to %s: %s', to, info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error.message || error);
    throw error;
  }
};
