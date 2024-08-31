const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');
const axios = require('axios');
const nodemailer = require('nodemailer'); 
require('dotenv').config({ path: './gmail.env' }); // Carregar as variáveis do arquivo .env

const app = express();
const port = 3000;

// Configuração da conexão com o banco de dados
const db = mysql.createConnection({
    host: 'localhost',
    user: 'joaoartur',
    password: 'gFt05zA%Y120DS',
    database: 'AirLume'
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Conectado ao banco de dados MySQL');
});

// Configuração do Nodemailer usando variáveis de ambiente
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


// (O restante do código permanece o mesmo)


// Configura a pasta 'public' como a pasta de arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para analisar os dados do formulário
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Rota de Cadastro
app.post('/cadastro', (req, res) => {
    const { nome, sobrenome, usuario, senha, dataNascimento, sexo, estado, cidade, rua, bairro, numero, cep, email, confirmarEmail } = req.body;

    if (!nome || !sobrenome || !usuario || !senha || !dataNascimento || !sexo || !estado || !cidade || !rua || !bairro || !numero || !cep || !email || !confirmarEmail) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    if (email !== confirmarEmail) {
        return res.status(400).json({ message: 'Os e-mails não coincidem.' });
    }

    // Verificar se o usuário já existe
    let sql = `SELECT * FROM usuarios WHERE usuario = ?`;
    db.query(sql, [usuario], (err, result) => {
        if (err) {
            console.error('Erro ao verificar usuário:', err);
            return res.status(500).json({ message: 'Erro ao verificar usuário.' });
        }

        if (result.length > 0) {
            return res.status(400).json({ message: 'Usuário já existe.' });
        } else {
            // Criptografar a senha
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(senha, salt);

            // Inserir novo usuário no banco de dados
            sql = `INSERT INTO usuarios (nome, sobrenome, usuario, senha, dataNascimento, sexo, estado, cidade, rua, bairro, numero, cep, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const values = [nome, sobrenome, usuario, hashedPassword, dataNascimento, sexo, estado, cidade, rua, bairro, numero, cep, email];

            db.query(sql, values, (err, result) => {
                if (err) {
                    console.error('Erro ao cadastrar usuário:', err);
                    return res.status(500).json({ message: 'Erro ao cadastrar usuário.' });
                }

                // Enviar e-mail de confirmação
                sendConfirmationEmail(email);

                res.json({ message: 'Usuário registrado com sucesso! Verifique seu e-mail para confirmar a conta.' });
            });
        }
    });
});

// Rota para preencher automaticamente o endereço com base no CEP
app.get('/endereco/:cep', (req, res) => {
    const cep = req.params.cep;

    axios.get(`https://viacep.com.br/ws/${cep}/json/`)
        .then(response => {
            res.json(response.data);
        })
        .catch(error => {
            console.error('Erro ao buscar endereço:', error);
            res.status(500).json({ message: 'Erro ao buscar endereço.' });
        });
});

// Rota de Login
app.post('/login', (req, res) => {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
        return res.status(400).json({ message: 'Usuário e senha são obrigatórios.' });
    }

    let sql = `SELECT * FROM usuarios WHERE usuario = ?`;
    db.query(sql, [usuario], (err, results) => {
        if (err) {
            console.error('Erro ao buscar usuário:', err);
            return res.status(500).json({ message: 'Erro ao buscar usuário.' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Usuário não encontrado.' });
        }

        const user = results[0];

        if (!bcrypt.compareSync(senha, user.senha)) {
            return res.status(401).json({ message: 'Senha incorreta.' });
        }

        res.json({ message: 'Login bem-sucedido!' });
    });
});

// Rota para receber os dados do sensor ultrassônico
app.get('/sensor_data', (req, res) => {
    const { distance } = req.query;

    if (!distance) {
        return res.status(400).json({ message: 'Distância não fornecida.' });
    }

    const sql = `INSERT INTO sensor_data (distance) VALUES (?)`;
    db.query(sql, [distance], (err, result) => {
        if (err) {
            console.error('Erro ao inserir dados do sensor:', err);
            return res.status(500).json({ message: 'Erro ao inserir dados do sensor.' });
        }
        res.json({ message: 'Dados do sensor armazenados com sucesso!' });
    });
});

// Rota para confirmar o e-mail
app.get('/confirmar', (req, res) => {
    const email = req.query.email;

    if (!email) {
        return res.status(400).json({ message: 'Email não fornecido.' });
    }

    // Marcar o e-mail como confirmado no banco de dados
    let sql = `UPDATE usuarios SET email_confirmado = TRUE WHERE email = ?`;
    db.query(sql, [email], (err, result) => {
        if (err) {
            console.error('Erro ao confirmar e-mail:', err);
            return res.status(500).json({ message: 'Erro ao confirmar e-mail.' });
        }
        res.sendFile(path.join(__dirname, 'public', 'Confirmacao.html'));
    });
});


// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
