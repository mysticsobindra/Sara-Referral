const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/User');
const { generateToken } = require('../services/Token');
const RefreshToken = require('../models/refreshToken');

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

        // Generate a access and refresh token
        const ACCESS_TOKEN=  generateToken({...user}, process.env.ACCESS_TOKEN_SECRET,"1min")
        const REFRESH_TOKEN=  generateToken({...user}, process.env.REFRESH_TOKEN_SECRET,'7d')

        // Save the refresh token in the database
        await RefreshToken.create({ refreshToken: REFRESH_TOKEN, userId: user._id });

        // Set the access and refresh token as cookies
        res.cookie('ACCESS_TOKEN', ACCESS_TOKEN, { httpOnly: true, maxAge: 60 * 60 * 1000 });
        res.cookie('REFRESH_TOKEN', REFRESH_TOKEN, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

        return res.json({ message: 'Login successful' });

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { Login };