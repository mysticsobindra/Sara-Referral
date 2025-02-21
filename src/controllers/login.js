const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/User');

async function Login(req, res) {
    const { email, password } = req.body;

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ user}, process.env.JWT_SECRET, { expiresIn: '10d' });

        res.cookie('token', token, { httpOnly: true, maxAge: 10 * 24 * 60 * 60 * 1000 });
        return res.json({ message: 'Login successful' });

    } catch (err) {
     
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { Login };