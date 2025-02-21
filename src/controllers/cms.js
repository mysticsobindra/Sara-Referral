const Earnings = require("../models/earnings");

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