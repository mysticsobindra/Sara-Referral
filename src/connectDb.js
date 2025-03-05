// 🔹 Third-Party Module Imports (npm packages)
const mongoose = require('mongoose');

async function connect_db(uri) {
  mongoose.connect(uri)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));
}

module.exports = { connect_db };
