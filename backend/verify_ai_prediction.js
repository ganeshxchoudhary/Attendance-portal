const API_URL = 'http://localhost:5000/api';

async function testPrediction() {
    try {
        console.log('--- Testing AI Prediction Endpoint ---');

        try {
            const response = await fetch(`${API_URL}/ai/predict`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    studentId: 'test-id',
                    currentAttendance: 85
                })
            });

            if (response.status === 401) {
                console.log('✅ Endpoint reached (Unauthorized as expected)');
            } else if (response.ok) {
                const data = await response.json();
                console.log('✅ Response:', data);
            } else {
                const text = await response.text();
                console.error('❌ Error response:', response.status, text);
            }
        } catch (error) {
            console.error('❌ Fetch error:', error.message);
        }

    } catch (err) {
        console.error('Test failed:', err.message);
    }
}

testPrediction();
