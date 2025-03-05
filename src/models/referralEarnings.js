// 🔹 Third-Party Module Imports (npm packages)
const mongoose = require('mongoose');

const { Schema } = mongoose;

const earnings_schema = new Schema({
    referrer_id: {
        type: String,
        required: true,
        ref: 'User'
    },
    referred_id: {
        type: String,
        required: true,
        ref: 'User'
    },
    earning_type: {
        type: String,
        enum: ['New_Referral', 'game_played' ],
        required: true
    },
    points_earned: {
        type: Number,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const referralEarnings = mongoose.model('referralEarnings', earnings_schema);

module.exports = referralEarnings;