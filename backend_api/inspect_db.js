const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config();

// Import models
const User = require('./models/User');
const Medicine = require('./models/Medicine');
const OcrResult = require('./models/OcrResult');

const inspect = async () => {
    try {
        console.log('\n📊 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected successfully to:', process.env.MONGODB_URI);
        console.log('----------------------------------------');

        // 1. Inspect Users
        const userCount = await User.countDocuments();
        console.log(`\n👥 USERS FOUND: ${userCount}`);
        if (userCount > 0) {
            const users = await User.find({}).select('firstName lastName email role isActive createdAt');
            console.table(users.map(u => ({
                ID: u._id.toString().substring(0, 8) + '...',
                Name: `${u.firstName} ${u.lastName}`,
                Email: u.email,
                Role: u.role,
                Active: u.isActive ? 'Yes' : 'No',
                Created: u.createdAt.toLocaleString()
            })));
        }

        // 2. Inspect Medicines
        const medCount = await Medicine.countDocuments();
        console.log(`\n💊 MEDICINES FOUND: ${medCount}`);
        if (medCount > 0) {
            const meds = await Medicine.find({}).limit(5).select('name manufacturer expiryDate stock');
            console.table(meds.map(m => ({
                Name: m.name,
                Manufacturer: m.manufacturer,
                Stock: m.stock,
                Expiry: m.expiryDate ? m.expiryDate.toDateString() : 'N/A'
            })));
            if (medCount > 5) console.log(`... and ${medCount - 5} more.`);
        }

        // 3. Inspect OCR Results
        const ocrCount = await OcrResult.countDocuments();
        console.log(`\n📷 SCAN RESULTS FOUND: ${ocrCount}`);
        if (ocrCount > 0) {
            const scans = await OcrResult.find({}).limit(5).select('medicineName confidence uploadedAt');
            console.table(scans.map(s => ({
                Medicine: s.medicineName,
                Confidence: s.confidence,
                Date: s.uploadedAt.toLocaleString()
            })));
        }

        console.log('\n----------------------------------------');
        console.log('Done.');

    } catch (error) {
        console.error('❌ Error inspecting DB:', error);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

inspect();
