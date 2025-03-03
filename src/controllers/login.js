const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/User');

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
        const user = await userModel.findOne({ email });

        // If the user does not exist, return an error
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check if the password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Generate a JWT token
        const token = jwt.sign({ user}, process.env.JWT_SECRET, { expiresIn: '10d' });

        // Set the token as a cookie
        res.cookie('token', token, { httpOnly: true, maxAge: 10 * 24 * 60 * 60 * 1000 });
        return res.json({ message: 'Login successful' });

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { Login };