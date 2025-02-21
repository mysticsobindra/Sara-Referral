const mongoose = require('mongoose');

async function connectDb(uri) {
    mongoose.connect(uri)
      .then(() => console.log("✅ MongoDB Connected"))
      .catch(err => console.error("❌ MongoDB Connection Error:", err));
}

module.exports = { connectDb };
