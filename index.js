const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Configuração do middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Importar rotas
const addressRoutes = require('./server/routes/addressRoutes');
const authRoutes = require('./server/routes/authRoutes');
const emailRoutes = require('./server/routes/emailRoutes');
const registerRoutes = require('./server/routes/registerRoutes');

// Usar rotas da API
app.use('/api/address', addressRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/register', registerRoutes);


// Rotas para páginas HTML
app.get('/index', (req, res) => {
  res.redirect('/index.html');
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});

app.get('/Cadastro.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Cadastro.html'));
});

app.get('/Confirmação.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Confirmação.html'));
});

app.get('/Login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Login.html'));
});

app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'dashboard.html'));
});

app.get('/upload.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'upload.html'));
});

app.get('/students.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'students.html'));
});

app.get('/devices.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'devices.html'));
});

app.get('/settings.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'settings.html'));
});

// Inicie o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
