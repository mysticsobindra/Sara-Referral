const mongoose = require('mongoose');

const { Schema } = mongoose;

const earningsSchema = new Schema({
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
        enum: ['New Referral', 'Game Played' ],
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

const referralEarnings = mongoose.model('referralEarnings', earningsSchema);

module.exports = referralEarnings;