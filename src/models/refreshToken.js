const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
    refreshToken: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    }
}, {
    timestamps: true,
});

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

module.exports = RefreshToken;