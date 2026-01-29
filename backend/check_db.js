import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const count = await User.countDocuments();
        console.log(`Total users in database: ${count}`);
        if (count > 0) {
            const users = await User.find({}, 'email role').limit(5);
            console.log('Sample users:', users);
        } else {
            console.log('Database is empty. Please run npm run seed');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error connecting to DB:', error.message);
        process.exit(1);
    }
};

checkDB();
