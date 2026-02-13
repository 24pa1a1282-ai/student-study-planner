const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();

// GET Login page
router.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// POST Login (MANDATORY: Use POST method)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.render('login', { error: 'Invalid email or password' });
        }

        // Compare password with hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.render('login', { error: 'Invalid email or password' });
        }

        // Create session
        req.session.user = {
            id: user._id,
            name: user.name,
            email: user.email
        };

        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.render('login', { error: 'Server error. Please try again.' });
    }
});

// GET Signup page
router.get('/signup', (req, res) => {
    res.render('signup', { error: null });
});

// POST Signup (MANDATORY: Use POST method)
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        // Validation
        if (password !== confirmPassword) {
            return res.render('signup', { error: 'Passwords do not match' });
        }

        // MANDATORY: Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('signup', { error: 'Email already registered' });
        }

        // MANDATORY: Hash password before saving
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();

        // Redirect to login
        res.redirect('/auth/login');
    } catch (error) {
        console.error(error);
        res.render('signup', { error: 'Server error. Please try again.' });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
});

module.exports = router;