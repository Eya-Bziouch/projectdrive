require('dotenv').config();
const mongoose = require('mongoose');

console.log('Attempting to connect...');
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 30000
})
    .then(() => {
        console.log('✅ Connected successfully!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ Connection failed:', err.message);
        process.exit(1);
    });