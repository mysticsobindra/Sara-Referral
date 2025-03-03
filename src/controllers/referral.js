const crypto = require('crypto');
const User = require('../models/User');
const Referral = require('../models/referrals');
const ReferralEarnings = require('../models/referralEarnings');

/**
 * Generates a unique referral code for a user if they do not already have one.
 * 
 * @async
 * @function GenerateReferralCode
 * @param {Object} req - The request object.
 * @param {Object} req.user - The user object attached to the request.
 * @param {Object} req.user.user - The user details.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Returns a JSON response with the referral code or an error message.
 * @throws {Error} - Throws an error if there is a server issue.
 */
const GenerateReferralCode = async (req, res) => {
    try {
        // Extract the user from the request object
        const user = req.user.user;

        // Check if the user already has a referral code
        const existingUserWithReferralCode = await User.findOne({ _id: user._id, referralCode: { $exists: true } });
        if (existingUserWithReferralCode) {
            return res.status(200).json({ message: "User already has a referral code", referralCode: existingUserWithReferralCode.referralCode });
        }

        // Generate a unique referral code
        let ReferralCode = await UniqueReferralCodeGenerator();

        // Update the user with the referral code
        const updatedUser = await User.findByIdAndUpdate(
            { _id: `${user._id}` },
            { $set: { referralCode: ReferralCode } },
            { upsert: true }
        );

        // Check if the user was updated
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Return the referral code
        return res.status(200).json({ referralCode: ReferralCode });

    } catch (error) {

        // Return a server error
        return res.status(500).json({ message: "Server error" });
    }
};

/**
 * Validates a referral code provided in the request parameters.
 *
 * @async
 * @function validateReferralCode
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.referralCode - The referral code to validate.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves to void.
 * @throws {Error} - Throws an error if there is a server issue.
 */


async function validateReferralCode(req, res) {
    // Extract the referral code from the request parameters
    const referralCode = req.params.referralCode;

    try {
        // Check if the referral code exists in the database
        const user = await User.findOne({ referralCode: referralCode });
        if (!user) {
            return res.status(404).json({ message: "Invalid referral code" });
        }

        // Return the referral code
        return res.status(200).json({ message: "Valid referral code", referralCode: referralCode });
   
    } catch (error) {

        return res.status(500).json({ message: "Server error" });
    }
}



/**
 * Retrieves the referral history for a specific user.
 *
 * @async
 * @function getReferralHistroy
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.userId - The ID of the user.
 * @param {Object} req.query - The query parameters.
 * @param {string} [req.query.filter] - The filter for the type of earnings -[New_Referral | Game_Played ] .
 * @param {string} [req.query.days] - The number of days to look back for referral history.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Returns a promise that resolves to void.
 * @throws {Error} - Throws an error if there is a server issue.
 */
async function getReferralHistroy(req, res) {
    // Extract the user ID from the request parameters
    const userId = req.params.userId;

    // Extract the filter and days from the query parameters
    const filter = req.query.filter;
    const days = req.query.days;

    try {
        // Query the database for the referral history
        let query = { referrer_id: userId };
 
        // Check if there is a filter
        if (filter) {
            query.earning_type = filter;
        }

        // Check if there is a days filter
        if (days) {
            const daysAgo = new Date();
            daysAgo.setDate(daysAgo.getDate() - parseInt(days));
            query.created_at = { $gte: daysAgo };
        }

        // Retrieve the referral history
        const referralHistory = await ReferralEarnings.find(query);

        // Check if there is referral history
        if (!referralHistory.length) {
            return res.status(404).json({ message: "No referral history found for this user" });
        }

        // Return the referral history
        return res.status(200).json({ referralHistory: referralHistory });

    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
}


/**
 * Generates a unique referral code.
 *
 * This function generates a random referral code and checks its uniqueness
 * against the database. It continues to generate new codes until a unique
 * code is found.
 *
 * @async
 * @function UniqueReferralCodeGenerator
 * @returns {Promise<string>} A promise that resolves to a unique referral code.
 */

// Generate a unique referral code
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



/**
 * Retrieves the referrals for a given user and calculates the total points earned from those referrals.
 *
 * @async
 * @function getYourReferrals
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.userId - The ID of the user whose referrals are to be retrieved.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves to void.
 * @throws {Error} - Throws an error if there is a server error.
 */
async function getYourReferrals(req, res) {

    // Extract the user ID from the request parameters
    const userId = req.params.userId;

    try {
        // Query the database for the referrals
        const referrals = await Referral.find({ referrer_id: userId }).populate('referred_id', 'email');
        if (!referrals.length) {
            return res.status(404).json({ message: "No referrals found for this user" });
        }

        // Calculate the total points earned from the referrals
        let totalPoints = 0;
        const referralDetails = [];
        // Loop through the referrals and calculate the total points earned
        for (const referral of referrals) {

            // Query the database for the earnings of the referral
            const referralEarnings = await ReferralEarnings.find({ referrer_id: userId, referred_id: referral.referred_id._id });
            let userTotalPoints = 0;

            // Calculate the total points earned by the user
            referralEarnings.forEach(earning => {
                totalPoints += earning.points_earned;
                userTotalPoints += earning.points_earned;
            });

            // Add the referral details to the response
            referralDetails.push({
                referredUser: referral.referred_id.email,
                referralDate: referral.created_at,
                pointsEarned: userTotalPoints
            });
        }

        // Sort the referral details by points earned
        referralDetails.sort((a, b) => b.pointsEarned - a.pointsEarned);

        // Return the referral details and total points earned
        return res.status(200).json({
            referrals: referralDetails,
            totalPoints: totalPoints
        });

    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
}


/**
 * Retrieves the top referrals and their earnings.
 *
 * @async
 * @function getTopReferrals
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Returns a JSON response with the top referrals or an error message.
 * @throws {Error} - Throws an error if there is a server issue.
 */
async function getTopReferrals(req, res) {

    try {
        // Query the database for all referrals
        const referrals = await Referral.find().populate('referred_id','email')

        // Check if there are referrals
        if (!referrals.length) {
            return res.status(404).json({ message: "No referrals found" });
        }
      
        //  Create an object to store the top referrers and their details
        const topReferrerDeatils = {};

        // Loop through the referrals and calculate the total points earned by the referrer
        for (const referral of referrals) {
            const referrerEarnings = await ReferralEarnings.find({ referrer_id: referral.referrer_id });
            // Calculate the total points earned by the referrer
            let totalPoints = 0;
            referrerEarnings.forEach(earning => {
                totalPoints += earning.points_earned;
            });

            // Add the referrer details to the response
            if (!topReferrerDeatils[referral.referrer_id]) {
                topReferrerDeatils[referral.referrer_id] = {
                    referrerId: referral.referrer_id,
                    totalPoints: 0,
                    referrals: []
                };
            }

            // Update the total points earned by the referrer
            topReferrerDeatils[referral.referrer_id].totalPoints += totalPoints;
            topReferrerDeatils[referral.referrer_id].referrals.push({
                referredUser: referral.referred_id,
                pointsEarned: totalPoints
            });
        }

        // Sort the top referrers by total points earned
        const sortedReferrals = Object.values(topReferrerDeatils).sort((a, b) => b.totalPoints - a.totalPoints);

        // Return the top referrers
        return res.status(200).json({ topReferrals: sortedReferrals });

    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
}




module.exports = { GenerateReferralCode, getTopReferrals, getYourReferrals, validateReferralCode, getReferralHistroy };
