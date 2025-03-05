// 🔹 Third-Party Module Imports (npm packages)
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const game_schema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuidv4
    },
    user_id: {
        type: String,
        required: true,
        ref: 'User'
    },
    game_name: {
        type: String,
        required: true,
        maxlength: 50
    },
    points_spent: {
        type: Number,
        required: true
    },
    platform_earnings: {
        type: Number,
        required: true
    },
    referrer_earnings: {
        type: Number,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const Game = mongoose.model('GameTransactions', game_schema);

module.exports = Game;