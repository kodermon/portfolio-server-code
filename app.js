// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const { Client } = require('pg');
require('dotenv').config()

const app = express();
const PORT = process.env.PORT || 5000;

// Use body-parser middleware to parse incoming JSON requests
app.use(cors())
app.use(bodyParser.json());

// Replace 'your_database_url' with your PostgreSQL database URL
const connectionString = process.env.CONNECTION_STRING;

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect();



// Create a table if not exists
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS contact_me (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL
  );
`;
client.query(createTableQuery, (err, res) => {
  if (err) {
    console.error('Error creating table', err);
  } else {
    console.log('Table created successfully');
  }
});

// API endpoint to handle form submissions
app.post('/submitForm', (req, res) => {
  const { name, email, message } = req.body;

  const insertQuery = `
    INSERT INTO contact_me (name, email, message)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;

  const values = [name, email, message];

  client.query(insertQuery, values, (err, result) => {
    if (err) {
      console.error('Error inserting data', err);
      res.status(500).send('Internal Server Error');
    } else {
      console.log('Data inserted successfully:', result.rows[0]);
      res.status(200).json(result.rows[0]);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
