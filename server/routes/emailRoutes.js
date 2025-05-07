const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

function sendConfirmationEmail(email) {
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Confirmação de Email',
        text: 'Por favor, clique no link a seguir para confirmar seu e-mail: file:///C:/Users/55199/OneDrive/Área%20de%20Trabalho/AirLume-main/public/Confirmacao.html' + encodeURIComponent(email)
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Erro ao enviar e-mail:', error);
        } else {
            console.log('E-mail enviado:', info.response);
        }
    });
}

module.exports = sendConfirmationEmail;
