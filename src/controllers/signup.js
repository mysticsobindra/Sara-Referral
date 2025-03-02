const userModel = require('../models/User');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const Referral = require('../models/referrals');
const referralEarnings = require('../models/referralEarnings');

const saltRounds = 10;

/**
 * Registers a new user.
 *
 * @async
 * @function registerUser
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.email - The email of the user.
 * @param {string} req.body.password - The password of the user.
 * @param {Object} req.params - The parameters of the request.
 * @param {string} req.params.referralCode - The referral code (optional).
 * @param {Object} res - The response object.
 * @returns {Promise<void>} Sends a response with the status and message.
 * @throws {Error} If there is an error during user registration.
 */

async function registerUser(req, res) {
    const { email, password } = req.body;
    const referralCode = req.query.referralCode;

    if (!email || !password) {
        return res.status(400).send('Email and password are required');
    }

    try {
        const existingUser = await userModel.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        let newReferralCode;
        let isUnique = false;
        while (!isUnique) {
            newReferralCode = crypto.randomBytes(3).toString('hex');
            const existingUser = await userModel.findOne({ referralCode: newReferralCode });
            if (!existingUser) {
                isUnique = true;
            }
        }

        let referringUser;
        if (referralCode) {
            referringUser = await userModel.findOne({ referralCode: referralCode });
            if (!referringUser) {
                return res.status(404).json({ message: "Invalid referral code" });
            }
        }

        const newUser = new userModel({
            email: email,
            password: hashedPassword,
            referralCode: newReferralCode,
            referredBy: referringUser ? referringUser._id : null
        });

        await newUser.save();

        if (referringUser) {
            const newReferral = new Referral({
                referrer_id: referringUser._id,
                referred_id: newUser._id
            });

            const referralEarning = new referralEarnings({
                referrer_id: referringUser._id,
                referred_id: newUser._id,
                earning_type: 'New Referral',
                points_earned: 100
            });

            await newReferral.save();
            await referralEarning.save();
        }

        res.status(201).send({ message: 'User created successfully', user: newUser });
    } catch (error) {
        res.status(500).send('Error registering user: ' + error.message);
    }
}

module.exports = { registerUser };