import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    role: {
        type: String,
        enum: ['student', 'teacher', 'admin'],
        required: true,
        default: 'student'
    },
    isApproved: {
        type: Boolean,
        default: function () {
            return this.role !== 'teacher'; // Teachers need approval, others auto-approved
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to check password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Virtual populate for role-specific data
userSchema.virtual('profile', {
    ref: function () {
        if (this.role === 'student') return 'Student';
        if (this.role === 'teacher') return 'Teacher';
        return null;
    },
    localField: '_id',
    foreignField: 'userId',
    justOne: true
});

const User = mongoose.model('User', userSchema);

export default User;
