const mysql = require('mysql2');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pfe_project',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const connection = mysql.createConnection(config);

const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    connection.query(`CREATE DATABASE IF NOT EXISTS ${config.database}`, (err) => {
      if (err) {
        console.error('Error creating the database:', err);
        return reject(err);
      }

      console.log(`“${config.database}” database created or already existing.`);
      resolve();
    });
  });
};

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }

  console.log('Connected to MySQL!');

  initializeDatabase()
    .then(() => {
      console.log('Database ready to use.');
    })
    .catch((err) => {
      console.error('Error during database initialization:', err);
    });
});

module.exports = connection;
