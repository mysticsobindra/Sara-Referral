const mongoose = require('mongoose');

const { Schema } = mongoose;

const earningsSchema = new Schema({
    user_id: {
        type: String,
        required: true,
        ref: 'User'
    },
    earning_type: {
        type: String,
        enum: ['Deposit', 'Game Played' ],
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

const Earnings = mongoose.model('Earnings', earningsSchema);

module.exports = Earnings;