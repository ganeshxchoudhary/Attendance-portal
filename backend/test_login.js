import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const testLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const email = 'teacher1@college.edu';
        const password = 'teacher123';

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            console.log('❌ User not found');
            process.exit(1);
        }

        const isMatch = await user.matchPassword(password);
        console.log(`Login test for ${email}:`);
        console.log(`- Password match: ${isMatch}`);
        console.log(`- Role: ${user.role}`);
        console.log(`- Is Approved: ${user.isApproved}`);

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

testLogin();
