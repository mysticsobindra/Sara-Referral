const userModel = require('../models/User');
const Earnings = require('../models/earnings');
const referralEarnings = require('../models/referralEarnings');
const { calculateReferralEarnings } = require('../utils/functions');

/**
 * Updates the user's balance based on their earnings and referral earnings , then return current Points of user .
 *
 * @async
 * @function TotalUserPoints
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.userId - The ID of the user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the user's balance is updated.
 * @throws {Error} - Throws an error if there is a server error.
 */
const TotalUserPoints = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: 'userModel ID and balance are required' });
        }

        const user = await userModel.findById({ _id: userId })

        if(!user){
            return res.status(400).json({ message: 'User not found' });
        }
        const earnings = await Earnings.find({ user_id: userId });

        const referral_Earnings_Details = await referralEarnings.find({ user_id: userId });

        const totalPoints = earnings.reduce((sum, earning) => sum + earning.points_earned, 0);
        const total_referral_Points = referral_Earnings_Details.reduce((sum, earning) => sum + earning.points_earned, 0);

        const Current_Balance = totalPoints + total_referral_Points;

        await userModel.findByIdAndUpdate({ _id: userId }, { Balance: Current_Balance });

        res.status(200).json({ Current_Balance });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

/**
 * Handles the game play request, records the earning, and responds with the result.
 * @function recordGamePlay
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.userId - The ID of the user playing the game.
 * @param {Object} req.body - The request body.
 * @param {number} req.body.balance - The balance to be deducted as points earned.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with status and message.
 */
function recordGamePlay(req, res) {
    // Extract the user ID and balance from the request
    const { userId } = req.params;

    // Extract the user ID and balance from the request
    const { balance } = req.body;

    // Check if the user ID and balance are provided
    if (!userId || balance === undefined) {
        return res.status(400).json({ message: 'userModel ID and balance are required' });
    }

    // Create a new earning record
    const new_Earning = new Earnings({
        user_id: userId,
        earning_type: 'Game_Played',
        points_earned: -balance
    });

    // Save the earning record
    new_Earning.save()
        .then(() => {
            res.status(200).json({ message: 'Game played and earning recorded successfully', new_Earning });
        })
        .catch((error) => {
            res.status(500).json({ message: 'Error recording earning', error });
        });
}

/**
 * Controller to handle fetching earnings for a specific user.
 *
 * @async
 * @function EarningsController
 * @param {Object} req - Express request object.
 * @param {Object} req.params - Request parameters.
 * @param {string} req.params.userId - ID of the user whose earnings are to be fetched.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the user's earnings or an error message.
 */
async function EarningsController(req, res) {
    // Extract the user ID from the request parameters
    const { userId } = req.params;

    // Check if the user ID is provided
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        // Fetch the earnings for the user
        const earnings = await Earnings.find({ user_id: userId });

        // Send the earnings as a response
        res.status(200).json({ earnings });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

/**
 * Controller for handling game decisions and recording earnings.
 * 
 * @async
 * @function recordGameOutcome
 * @param {Object} req - Express request object.
 * @param {Object} req.params - Request parameters.
 * @param {string} req.params.userId - ID of the user making the decision.
 * @param {Object} req.body - Request body.
 * @param {string} req.body.decision - Decision made by the user ('win' or other).
 * @param {number} req.body.stakeAmount - Amount of stake involved in the game.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Returns a promise that resolves to void.
 * @throws {Error} - Throws an error if there is a server error.
 */
async function recordGameOutcome(req, res) {

    // Extract the user ID, decision, and stake amount from the request
    const { userId } = req.params;
    const { decision, stakeAmount } = req.body;
    try {
        // Check if the user ID and decision are provided
        if (!userId || !decision) {
            return res.status(400).json({ message: 'User ID and decision are required' });
        }

        // Check if the decision is 'win' or 'lose'
        if (decision == 'win') {
            // Create a new earning record
            const new_Earning = new Earnings({
                user_id: userId,
                earning_type: 'Game_Played',
                points_earned: stakeAmount
            });

            // Save the earning record
            new_Earning.save()
                .then(() => {
                    res.status(200).json({ message: 'Game played and earning recorded successfully', new_Earning });
                })
                .catch((error) => {
                    res.status(500).json({ message: 'Error recording earning', error });
                });
        } 

        // If the user loses the game
        else {
            // Create a new earning record
            let new_Referral_learning;
            // Fetch the user details
            const user = await userModel.findById(userId);

            // Calculate the referral earnings
            const Referral_Commission_Amount = calculateReferralEarnings(stakeAmount, 20, 10);

            // Check if the user has a referrer
            if (!!user.referredBy) {
           
                // Create a new referral earning record
                new_Referral_learning = new referralEarnings({
                    referrer_id: user.referredBy,
                    referred_id: userId,
                    earning_type: 'Game_Played',
                    points_earned: Referral_Commission_Amount
                });

                // Save the referral earning record
                await new_Referral_learning.save()
             
            }

            // Create a new earning record
            const new_Earning = new Earnings({
                user_id: userId,
                earning_type: 'Game_Played',
                points_earned: -stakeAmount
            });

            // Save the earning record
            await new_Earning.save()
            res.status(200).json({ message: 'Game played and earning recorded successfully', new_Earning, new_Referral_learning });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });

    }
}

module.exports = { TotalUserPoints,
    recordGamePlay,
    EarningsController,
    recordGameOutcome, };