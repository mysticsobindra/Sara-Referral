const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({

    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    referral_code: {
        type: String,
    },
    referred_By: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    Balance: {
        type: Number,
        default: 0
    },
    created_At: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;