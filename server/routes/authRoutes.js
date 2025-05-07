const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('./databaseRoutes.js'); // Arquivo de conexão com banco de dados
const sendConfirmationEmail = require('./emailRoutes.js'); // Função de envio de email

// Rota de Cadastro
router.post('/Cadastro.html', (req, res) => {
    console.log('Recebendo dados de cadastro:', req.body);

    const { nome, sobrenome, usuario, senha, dataNascimento, sexo, estado, cidade, rua, bairro, numero, cep, email, confirmarEmail } = req.body;

    // Verificação de campos obrigatórios
    if (!nome || !sobrenome || !usuario || !senha || !dataNascimento || !sexo || !estado || !cidade || !rua || !bairro || !numero || !cep || !email || !confirmarEmail) {
        console.log('Erro: Campos obrigatórios faltando');
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    // Verificação de e-mail
    if (email !== confirmarEmail) {
        console.log('Erro: Emails não coincidem');
        return res.status(400).json({ message: 'Os e-mails não coincidem.' });
    }

    // Verificação se o usuário já existe
    const sql = `SELECT * FROM usuarios WHERE usuario = ?`;
    db.query(sql, [usuario], (err, result) => {
        if (err) {
            console.error('Erro ao verificar usuário:', err);
            return res.status(500).json({ message: 'Erro ao verificar usuário.' });
        }

        if (result.length > 0) {
            console.log('Erro: Usuário já existe');
            return res.status(400).json({ message: 'Usuário já existe.' });
        } 

        // Cadastro do novo usuário
        console.log('Usuário não existe, prosseguindo com o cadastro');
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(senha, salt);

        const sqlInsert = `INSERT INTO usuarios (nome, sobrenome, usuario, senha, dataNascimento, sexo, estado, cidade, rua, bairro, numero, cep, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [nome, sobrenome, usuario, hashedPassword, dataNascimento, sexo, estado, cidade, rua, bairro, numero, cep, email];

        db.query(sqlInsert, values, (err, result) => {
            if (err) {
                console.error('Erro ao cadastrar usuário:', err);
                return res.status(500).json({ message: 'Erro ao cadastrar usuário.' });
            }

            console.log('Usuário cadastrado com sucesso:', result);
            sendConfirmationEmail(email); // Envio do e-mail de confirmação

            res.json({ message: 'Usuário registrado com sucesso! Verifique seu e-mail para confirmar a conta.' });
        });
    });
});

// Rota de Login
router.post('/login', (req, res) => {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
        return res.status(400).json({ message: 'Usuário e senha são obrigatórios.' });
    }

    const sql = `SELECT * FROM usuarios WHERE usuario = ?`;
    db.query(sql, [usuario], (err, results) => {
        if (err) {
            console.error('Erro ao buscar usuário:', err);
            return res.status(500).json({ message: 'Erro ao buscar usuário.' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Usuário não encontrado.' });
        }

        const user = results[0];

        // Comparar a senha criptografada
        if (!bcrypt.compareSync(senha, user.senha)) {
            return res.status(401).json({ message: 'Senha incorreta.' });
        }

        res.json({ message: 'Login bem-sucedido!' });
    });
});

module.exports = router;
