const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('./databaseRoutes.js'); // Conexão com o banco de dados
const sendConfirmationEmail = require('./emailRoutes.js'); // Envio de e-mail de confirmação

// Rota de Registro
router.post('/register', async (req, res) => {
    const { nome, sobrenome, usuario, senha, confirmarSenha, numero, email, dataNascimento, sexo, estado, cidade, rua, bairro, cep } = req.body;

    // Verificar campos obrigatórios
    if (!nome || !sobrenome || !usuario || !senha || !confirmarSenha || !numero || !email || !dataNascimento || !sexo || !estado || !cidade || !rua || !bairro || !cep) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    // Verificar se as senhas coincidem
    if (senha !== confirmarSenha) {
        return res.status(400).json({ message: 'As senhas não coincidem.' });
    }

    // Verificar se o usuário já existe
    const sqlCheckUser = 'SELECT * FROM usuarios WHERE usuario = ? OR email = ?';
    db.query(sqlCheckUser, [usuario, email], (err, result) => {
        if (err) {
            console.error('Erro ao verificar usuário:', err);
            return res.status(500).json({ message: 'Erro ao verificar usuário.' });
        }

        if (result.length > 0) {
            return res.status(400).json({ message: 'Usuário ou e-mail já cadastrados.' });
        }

        // Criptografar a senha
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(senha, salt);

        // Inserir dados no banco
        const sqlInsertUser = `INSERT INTO usuarios (nome, sobrenome, usuario, senha, numero, email, dataNascimento, sexo, estado, cidade, rua, bairro, cep) 
                               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const values = [nome, sobrenome, usuario, hashedPassword, numero, email, dataNascimento, sexo, estado, cidade, rua, bairro, cep];

        db.query(sqlInsertUser, values, (err, result) => {
            if (err) {
                console.error('Erro ao cadastrar usuário:', err);
                return res.status(500).json({ message: 'Erro ao cadastrar usuário.' });
            }

            // Envio de e-mail de confirmação
            sendConfirmationEmail(email);

            res.json({ message: 'Usuário registrado com sucesso! Verifique seu e-mail para confirmar sua conta.' });
        });
    });
});

module.exports = router;
