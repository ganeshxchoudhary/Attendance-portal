import rateLimit from 'express-rate-limit';

// Rate limiter for auth routes to prevent brute force
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per windowMs (relaxed for testing)
    handler: (req, res, next, options) => {
        res.status(options.statusCode).json({ message: options.message });
    },
    message: 'Too many login attempts, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});

// General API rate limiter
export const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    handler: (req, res, next, options) => {
        res.status(options.statusCode).json({ message: options.message });
    },
    message: 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});
