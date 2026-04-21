const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, '../data/users.json');

// Mock in-memory user database initialized from file
let users = [];

if (fs.existsSync(usersFilePath)) {
    try {
        const fileContent = fs.readFileSync(usersFilePath, 'utf8');
        users = JSON.parse(fileContent);
    } catch (e) {
        console.error("Error parsing users file: ", e);
    }
}

const saveUsers = () => {
    try {
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    } catch (e) {
        console.error("Error saving users file: ", e);
    }
};

router.post('/register', (req, res) => {
    const { name, id, email, password } = req.body;
    
    if (!name || !id || !email || !password) {
        return res.json({ success: false, message: 'All fields are required' });
    }
    
    // Check if user already exists
    const existingUser = users.find(u => u.id === id || u.email === email);
    if (existingUser) {
        return res.json({ success: false, message: 'User with this phone or email already exists' });
    }
    
    // Create new user
    const newUser = { name, id, email, password };
    users.push(newUser);
    saveUsers();
    
    res.json({ success: true, message: 'Account created successfully' });
});

router.post('/login', (req, res) => {
    const { id, password } = req.body;
    
    const user = users.find(u => u.id === id && u.password === password);
    
    if (user) {
        // Return a dummy token
        res.json({ 
            success: true, 
            token: 'dummy-token-' + Date.now(), 
            user: { name: user.name, id: user.id } 
        });
    } else {
        res.json({ success: false, message: 'Invalid credentials' });
    }
});

module.exports = router;
