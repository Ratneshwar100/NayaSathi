const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const mockDataPath = path.join(__dirname, '../data/mockData.json');

router.get('/', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));
        const rights = data.rights;
        res.json({ success: true, rights: rights });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
