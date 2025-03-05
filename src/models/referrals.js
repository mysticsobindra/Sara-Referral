// 🔹 Third-Party Module Imports (npm packages)
const mongoose = require('mongoose');

const { Schema } = mongoose;

const referral_schema = new Schema({
    referrer_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Referrer ID is required']
    },
    referred_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Referred ID is required']
    },
    signup_bonus: {
        type: Number,
        default: 100
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const Referral = mongoose.model('Referral', referral_schema);

module.exports = Referral;