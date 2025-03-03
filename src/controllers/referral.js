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
        const user = req.user;

        // Check if the user already has a referral code
        const existingUserWithReferralCode = await User.findOne({ _id: user._id, referralCode: { $exists: true } });
        if (existingUserWithReferralCode) {
            return res.status(200).json({ message: "User already has a referral code", referral_Code: existingUserWithReferralCode.referralCode });
        }

        // Generate a unique referral code
        let ReferralCode = await UniqueReferralCodeGenerator();

        // Update the user with the referral code
        const updatedUser = await User.findByIdAndUpdate(
            { _id: `${user._id}` },
            { $set: { referral_Code: ReferralCode } },
            { upsert: true }
        );

        // Check if the user was updated
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Return the referral code
        return res.status(200).json({ referral_Code: ReferralCode });

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
 * @param {string} req.params.referral_Code - The referral code to validate.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves to void.
 * @throws {Error} - Throws an error if there is a server issue.
 */


async function validateReferralCode(req, res) {
    // Extract the referral code from the request parameters
    const referral_Code = req.params.referral_Code;

    try {
        // Check if the referral code exists in the database
        const user = await User.findOne({ referral_Code: referral_Code });
        if (!user) {
            return res.status(404).json({ message: "Invalid referral code" });
        }

        // Return the referral code
        return res.status(200).json({ message: "Valid referral code", referral_Code: referral_Code });
   
    } catch (error) {

        return res.status(500).json({ message: "Server error" });
    }
}



/**
 * Retrieves the referral history for a specific user.
 *
 * @async
 * @function getReferralHistory
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
async function getReferralHistory(req, res) {
    // Extract the user ID from the request parameters
    const user_Id = req.params.userId;

    // Extract the filter and days from the query parameters
    const filter = req.query.filter;
    const days = req.query.days;

    try {
        // Query the database for the referral history
        let query = { referrer_id: user_Id };
 
        // Check if there is a filter
        if (filter) {
            query.earning_type = filter;
        }

        // Check if there is a days filter
        if (days) {
            const days_Ago = new Date();
            days_Ago.setDate(days_Ago.getDate() - parseInt(days));
            query.created_at = { $gte: days_Ago };
        }

        // Retrieve the referral history
        const referral_History = await ReferralEarnings.find(query);

        // Check if there is referral history
        if (!referral_History.length) {
            return res.status(404).json({ message: "No referral history found for this user" });
        }

        // Return the referral history
        return res.status(200).json({ referral_History: referral_History });

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
    let referral_Code;
    let isUnique = false;
    while (!isUnique) {
        referral_Code = crypto.randomBytes(3).toString('hex');
        const existingUser = await User.findOne({ referralCode: referral_Code });
        if (!existingUser) {
            isUnique = true;
        }
    }
    return referral_Code;

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
        let total_Points = 0;
        const referral_Details = [];
        // Loop through the referrals and calculate the total points earned
        for (const referral of referrals) {

            // Query the database for the earnings of the referral
            const referral_Earnings = await ReferralEarnings.find({ referrer_id: userId, referred_id: referral.referred_id._id });
            let user_Total_Points = 0;

            // Calculate the total points earned by the user
            referral_Earnings.forEach(earning => {
                total_Points += earning.points_earned;
                user_Total_Points += earning.points_earned;
            });

            // Add the referral details to the response
            referral_Details.push({
                referredUser: referral.referred_id.email,
                referralDate: referral.created_at,
                pointsEarned: user_Total_Points
            });
        }

        // Sort the referral details by points earned
        referral_Details.sort((a, b) => b.pointsEarned - a.pointsEarned);

        // Return the referral details and total points earned
        return res.status(200).json({
            referrals: referral_Details,
            total_Points: total_Points
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
        const top_Referrer_Details = {};

        // Loop through the referrals and calculate the total points earned by the referrer
        for (const referral of referrals) {
            const referrer_Earnings = await ReferralEarnings.find({ referrer_id: referral.referrer_id });
            // Calculate the total points earned by the referrer
            let total_Points = 0;
            referrer_Earnings.forEach(earning => {
                total_Points += earning.points_earned;
            });

            // Add the referrer details to the response
            if (!top_Referrer_Details[referral.referrer_id]) {
                top_Referrer_Details[referral.referrer_id] = {
                    referrerId: referral.referrer_id,
                    total_Points: 0,
                    referrals: []
                };
            }

            // Update the total points earned by the referrer
            top_Referrer_Details[referral.referrer_id].total_Points += total_Points;
            top_Referrer_Details[referral.referrer_id].referrals.push({
                referredUser: referral.referred_id,
                pointsEarned: total_Points
            });
        }

        // Sort the top referrers by total points earned
        const sorted_Referrals = Object.values(top_Referrer_Details).sort((a, b) => b.total_Points - a.total_Points);

        // Return the top referrers
        return res.status(200).json({ topReferrals: sorted_Referrals });

    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
}




module.exports = { GenerateReferralCode, getTopReferrals, getYourReferrals, validateReferralCode, getReferralHistory };
