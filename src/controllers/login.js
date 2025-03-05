// 🔹 Third-Party Module Imports (npm packages)
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 🔹 Internal Module Imports (Project files)
const user_model = require('../models/User');
const { generate_token } = require('../services/Token');

/**
 * Handles user login by verifying email and password, generating a JWT token, and setting it as a cookie.
 *
 * @async
 * @function Login
 * @param {Object} req - Express request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.email - The email of the user attempting to log in.
 * @param {string} req.body.password - The password of the user attempting to log in.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Returns a promise that resolves to void.
 * @throws {Error} - Throws an error if there is a server issue.
 */
async function Login(req, res) {
    // Extract the email and password from the request body
    const { email, password } = req.body;
    try {
        // Check if the user exists
        const user = await user_model.findOne({ email });

        // If the user does not exist, return an error
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check if the password is correct
        const is_match = await bcrypt.compare(password, user.password);
        if (!is_match) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Generate a access and refresh token
        const access_token=  generate_token({...user}, process.env.ACCESS_TOKEN_SECRET,"15min")
        const refresh_token=  generate_token({...user}, process.env.REFRESH_TOKEN_SECRET,'7d')
        
        // Set the access and refresh token as cookies
        res.cookie('access_token', access_token, { httpOnly: true, maxAge: 60 * 60 * 1000 });
        res.cookie('refresh_token', refresh_token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

        return res.json({ message: 'Login successful' });

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { Login };