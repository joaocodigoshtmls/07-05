const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'joaoartur',
    password: 'Xgasqaow201P!@9mw',
    database: 'AirLume'
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    } else {
        console.log('Conectado ao banco de dados MySQL');
    }
});

module.exports = db;
