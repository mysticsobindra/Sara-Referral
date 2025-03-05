// 🔹 Third-Party Module Imports (npm packages)
const mongoose = require('mongoose');

const { Schema } = mongoose;

const earnings_schema = new Schema({
    referrer_id: {
        type: String,
        required: [true, 'Referrer ID is required'],
        ref: 'User'
    },
    referred_id: {
        type: String,
        required: [true, 'Referred ID is required'],
        ref: 'User'
    },
    earning_type: {
        type: String,
        enum: ['New_Referral', 'game_played'],
        required: [true, 'Earning type is required']
    },
    points_earned: {
        type: Number,
        required: [true, 'Points earned is required']
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const referralEarnings = mongoose.model('referralEarnings', earnings_schema);

module.exports = referralEarnings;