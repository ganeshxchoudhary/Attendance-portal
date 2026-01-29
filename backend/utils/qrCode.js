import QRCode from 'qrcode';
import crypto from 'crypto';

// Generate QR code for attendance
export const generateAttendanceQR = async (sessionData) => {
    try {
        // Create encrypted session token
        const token = crypto.randomBytes(32).toString('hex');

        // Combine session data with token
        const qrData = JSON.stringify({
            token,
            subjectId: sessionData.subjectId,
            teacherId: sessionData.teacherId,
            date: sessionData.date,
            expiresAt: sessionData.expiresAt
        });

        // Generate QR code as data URL
        const qrCodeDataURL = await QRCode.toDataURL(qrData, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 300,
            margin: 2
        });

        return {
            qrCode: qrCodeDataURL,
            token,
            expiresAt: sessionData.expiresAt
        };
    } catch (error) {
        throw new Error('Failed to generate QR code: ' + error.message);
    }
};

// Validate QR code session
export const validateQRSession = (qrData, storedSession) => {
    try {
        const parsedData = JSON.parse(qrData);

        // Check if session exists
        if (!storedSession) {
            return { valid: false, message: 'Invalid QR code session' };
        }

        // Check if token matches
        if (parsedData.token !== storedSession.token) {
            return { valid: false, message: 'Invalid QR code token' };
        }

        // Check if expired
        const now = new Date();
        const expiresAt = new Date(parsedData.expiresAt);

        if (now > expiresAt) {
            return { valid: false, message: 'QR code has expired' };
        }

        return {
            valid: true,
            data: {
                subjectId: parsedData.subjectId,
                teacherId: parsedData.teacherId,
                date: parsedData.date
            }
        };
    } catch (error) {
        return { valid: false, message: 'Invalid QR code format' };
    }
};
