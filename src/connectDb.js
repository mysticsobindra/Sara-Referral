// 🔹 Third-Party Module Imports (npm packages)
const mongoose = require('mongoose');

async function connect_db(uri) {
  mongoose.connect(uri)
    .then(() => console.log("✅ MongoDB Connected"))
}

module.exports = { connect_db };
