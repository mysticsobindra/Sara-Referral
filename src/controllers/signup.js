const userModel = require('../models/User');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const saltRounds = 10;

async function registerUser(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Email and password are required');
    }
    try {
        const existingUser = await userModel.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        let referralCode;
        let isUnique = false;
        while (!isUnique) {
            referralCode = crypto.randomBytes(3).toString('hex');
            const existingUser = await userModel.findOne({ referralCode: referralCode });
            if (!existingUser) {
                isUnique = true;
            }
        }

        const newUser = await userModel.create({ email, password: hashedPassword ,referralCode:referralCode});

        res.status(201).send({ message: 'User created successfully', user: newUser });
    } catch (error) {
        res.status(500).send('Error registering user: ' + error.message);
    }
}

module.exports = { registerUser };