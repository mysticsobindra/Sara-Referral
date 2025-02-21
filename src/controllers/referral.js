const crypto = require('crypto');
const User = require('../models/User');
const Referral = require('../models/referrals');
const ReferralEarnings = require('../models/referralEarnings');

const GenerateReferralCode = async (req, res) => {
    try {
        const user = req.user.user;

        const existingUserWithReferralCode = await User.findOne({ _id: user._id, referralCode: { $exists: true } });
        if (existingUserWithReferralCode) {
            return res.status(200).json({ message: "User already has a referral code", referralCode: existingUserWithReferralCode.referralCode });
        }

        let ReferralCode = await UniqueReferralCodeGenerator();

        const updatedUser = await User.findByIdAndUpdate(
            { _id: `${user._id}` },
            { $set: { referralCode: ReferralCode } },
            { upsert: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ referralCode: ReferralCode });

    } catch (error) {
       
        return res.status(500).json({ message: "Server error" });
    }
};

async function validateReferralCode(req, res) {
    const referralCode = req.params.referralCode;
    try {
        const user = await User.findOne({ referralCode: referralCode });
        if (!user) {
            return res.status(404).json({ message: "Invalid referral code" });
        }
        return res.status(200).json({ message: "Valid referral code", referralCode: referralCode });
    } catch (error) {
      
        return res.status(500).json({ message: "Server error" });
    }
}

async function registerWithReferralCode(req, res) {
    const { email, password } = req.body;
    const referralCode = req.params.referralCode;

    try {

        const referringUser = await User.findOne({ referralCode: referralCode });

        if (!referringUser) {
            return res.status(404).json({ message: "Invalid referral code" });
        }


        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        let ReferralCode = await UniqueReferralCodeGenerator();

        const newUser = new User({
            email: email,
            password: password,
            referredBy: referringUser._id,
            referralCode: ReferralCode
        });

        const newReferral = new Referral({
            referrer_id: referringUser._id,
            referred_id: newUser._id
        });

        const ReferralEarning = new ReferralEarnings({
            referral_id: referringUser._id,
            referred_id: newUser._id,
            earning_type: 'New Referral',
            points_earned: 100
        });

        await ReferralEarning.save();
        await newUser.save();
        await newReferral.save();

      
        return res.status(201).json({ message: "User registered successfully", user: newUser, referrel: newReferral });

    } catch (error) {
    
        return res.status(500).json({ message: "Server error" });
    }
}


async function getReferralHistroy(req, res) {
    const userId = req.params.userId;
    const filter = req.query.filter;


    try {
        let query = { referral_id: userId };

        if (filter) {
            query.earning_type = filter;
        }


        const referralHistory = await ReferralEarnings.find(query);

        if (!referralHistory.length) {
            return res.status(404).json({ message: "No referral history found for this user" });
        }

        return res.status(200).json({ referralHistory: referralHistory });

    } catch (error) {
      
        return res.status(500).json({ message: "Server error" });
    }
}


async function UniqueReferralCodeGenerator() {
    let referralCode;
    let isUnique = false;
    while (!isUnique) {
        referralCode = crypto.randomBytes(3).toString('hex');
        const existingUser = await User.findOne({ referralCode: referralCode });
        if (!existingUser) {
            isUnique = true;
        }
    }
    return referralCode;

}




module.exports = { GenerateReferralCode, validateReferralCode, registerWithReferralCode, getReferralHistroy };
