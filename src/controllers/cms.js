const Earnings = require("../models/earnings");

/**
 * Updates the total points for a user by recording a deposit.
 *
 * @async
 * @function updateTotalPoints
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.userId - The ID of the user.
 * @param {Object} req.body - The request body.
 * @param {number} req.body.Balance - The balance to be credit as points .
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 * @throws {Error} - Throws an error if there is a server error.
 */
const updateTotalPoints = async (req, res) => {
    const { userId } = req.params;
    const { Balance } = req.body;
    try {
        
        const newEarning = new Earnings({
            user_id: userId,
            earning_type: 'Deposit',
            points_earned: Balance
        });
  
        newEarning.save()
            .then(() => {
                res.status(200).json({ message: 'Deposit successfully', newEarning });
            })
            .catch((error) => {
                res.status(500).json({ message: 'Error recording Deposit', error });
            });

        res.status(200).json({ message: 'Total points updated successfully', newEarning });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = {
    updateTotalPoints
};