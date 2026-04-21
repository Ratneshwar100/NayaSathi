const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const mockDataPath = path.join(__dirname, '../data/mockData.json');

router.get('/', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));
        let schemes = data.schemes;

        // Basic filtering mock
        if (req.query.category) {
            schemes = schemes.filter(s => s.category.toLowerCase() === req.query.category.toLowerCase());
        }

        res.json({ success: true, count: schemes.length, schemes: schemes });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
