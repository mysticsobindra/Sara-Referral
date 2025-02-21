const mongoose = require('mongoose');

const { Schema } = mongoose;

const referralSchema = new Schema({
    referrer_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    referred_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
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

const Referral = mongoose.model('Referral', referralSchema);

module.exports = Referral;