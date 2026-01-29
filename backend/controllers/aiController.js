import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const predictAttendance = async (req, res) => {
    try {
        const { studentId, currentAttendance } = req.body;

        if (!studentId) {
            return res.status(400).json({ message: 'Student ID is required' });
        }

        const dataToPredict = {
            studentId,
            currentAttendance: currentAttendance || 75 // Default to 75 if not provided
        };

        const pythonScriptPath = path.join(__dirname, '..', 'python', 'predict.py');

        // Spawn Python process
        const pythonProcess = spawn('python3', [pythonScriptPath]);

        let resultData = '';
        let errorData = '';

        // Send data to Python script via stdin
        pythonProcess.stdin.write(JSON.stringify(dataToPredict));
        pythonProcess.stdin.end();

        pythonProcess.stdout.on('data', (data) => {
            resultData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Python script exited with code ${code}`);
                console.error(`Error: ${errorData}`);
                return res.status(500).json({ message: 'Error in AI prediction', error: errorData });
            }

            try {
                const prediction = JSON.parse(resultData);
                if (prediction.error) {
                    return res.status(500).json({ message: prediction.error });
                }
                res.status(200).json(prediction);
            } catch (err) {
                console.error('Error parsing Python output:', err);
                res.status(500).json({ message: 'Failed to parse AI response' });
            }
        });

    } catch (error) {
        console.error('AI Controller Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
