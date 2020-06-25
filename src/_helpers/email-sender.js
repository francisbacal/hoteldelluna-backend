const nodemailer = require('nodemailer');

module.exports = sendEmail;

async function sendEmail({ to, subject, html, from = 'vagueseer@yahoo.com' }) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.mail.yahoo.com',
        port: '465',
        secure: true,
        auth: {
            user: "vagueseer@yahoo.com",
            pass: "yedtdljifetsxhix"
        }
    });
    await transporter.sendMail({from, to, subject, html})
}