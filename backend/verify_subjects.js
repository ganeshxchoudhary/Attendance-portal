import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Subject from './models/Subject.js';

dotenv.config();

const verifySubjects = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const subjects = await Subject.find({}, 'name code').sort({ createdAt: 1 });
        console.log(`✅ Found ${subjects.length} subjects:`);
        subjects.forEach(s => console.log(`- ${s.name} (${s.code})`));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

verifySubjects();
