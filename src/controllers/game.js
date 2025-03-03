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

        const referralEarningsDeatils = await referralEarnings.find({ user_id: userId });

        const totalPoints = earnings.reduce((sum, earning) => sum + earning.points_earned, 0);
        const totalreferralPoints = referralEarningsDeatils.reduce((sum, earning) => sum + earning.points_earned, 0);

        const CurrentBalance = totalPoints + totalreferralPoints;

        await userModel.findByIdAndUpdate({ _id: userId }, { Balance: CurrentBalance });

        res.status(200).json({ CurrentBalance });

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
    const { userId } = req.params;
    const { balance } = req.body;

    if (!userId || balance === undefined) {
        return res.status(400).json({ message: 'userModel ID and balance are required' });
    }
    const newEarning = new Earnings({
        user_id: userId,
        earning_type: 'Game Played',
        points_earned: -balance
    });

    newEarning.save()
        .then(() => {
            res.status(200).json({ message: 'Game played and earning recorded successfully', newEarning });
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
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        const earnings = await Earnings.find({ user_id: userId });

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

    const { userId } = req.params;
    const { decision, stakeAmount } = req.body;
    try {
        if (!userId || !decision) {
            return res.status(400).json({ message: 'User ID and decision are required' });
        }

        if (decision == 'win') {
      
            const newEarning = new Earnings({
                user_id: userId,
                earning_type: 'Game Played',
                points_earned: stakeAmount
            });

            newEarning.save()
                .then(() => {
                    res.status(200).json({ message: 'Game played and earning recorded successfully', newEarning });
                })
                .catch((error) => {
                    res.status(500).json({ message: 'Error recording earning', error });
                });
        } else {
            let newReferralearning;
            const user = await userModel.findById(userId);

            const ReferralCommisionAmount = calculateReferralEarnings(stakeAmount, 20, 10);

            if (!!user.referredBy) {
           
                newReferralearning = new referralEarnings({
                    referrer_id: user.referredBy,
                    referred_id: userId,
                    earning_type: 'Game Played',
                    points_earned: ReferralCommisionAmount
                });

                await newReferralearning.save()
             
            }

            const newEarning = new Earnings({
                user_id: userId,
                earning_type: 'Game Played',
                points_earned: -stakeAmount
            });

            await newEarning.save()
            res.status(200).json({ message: 'Game played and earning recorded successfully', newEarning, newReferralearning });
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