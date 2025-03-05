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
        required: [true, 'User ID is required'],
        ref: 'User'
    },
    game_name: {
        type: String,
        required: [true, 'Game name is required'],
    },
    points_spent: {
        type: Number,
        required: [true, 'Points spent is required']
    },
    platform_earnings: {
        type: Number,
        required: [true, 'Platform earnings is required']
    },
    referrer_earnings: {
        type: Number,
        required: [true, 'Referrer earnings is required']
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const Game = mongoose.model('GameTransactions', game_schema);

module.exports = Game;