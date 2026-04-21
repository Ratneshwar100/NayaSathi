require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', require('./api/auth'));
app.use('/api/chatbot', require('./api/chatbot'));
app.use('/api/schemes', require('./api/schemes'));
app.use('/api/rights', require('./api/rights'));
app.use('/api/documents', require('./api/documents'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`NyayaSathi Server is running on port ${PORT}`);
});
