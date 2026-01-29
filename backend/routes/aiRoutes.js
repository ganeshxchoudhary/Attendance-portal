import express from 'express';
import { predictAttendance } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/predict', protect, predictAttendance);

export default router;
