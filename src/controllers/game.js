const userModel = require('../models/User');
const Earnings = require('../models/earnings');
const referralEarnings = require('../models/referralEarnings');
const { calculateReferralEarnings } = require('../utils/functions');

const updateUserBalance = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: 'userModel ID and balance are required' });
        }

        const earnings = await Earnings.find({ user_id: userId });
        const user = await userModel.findById({ _id: userId })
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

function playGame(req, res) {
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

async function EarningsController(req, res) {
    console.log('hello')
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

async function GameDecisionController(req, res) {

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
                    referral_id: user.referredBy,
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

module.exports = { updateUserBalance, playGame, EarningsController, GameDecisionController };