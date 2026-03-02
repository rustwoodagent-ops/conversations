// Howard Laboratory - Check website deployment
const https = require('https');

const checkDeployment = () => {
    const options = {
        hostname: 'rustwoodagent-ops.github.io',
        port: 443,
        path: '/conversations/',
        method: 'GET',
        headers: {
            'User-Agent': 'Howard-Lab-Checker/1.0'
        }
    };

    const req = https.request(options, (res) => {
        console.log('Status:', res.statusCode);
        res.on('data', (chunk) => {
            if (chunk.toString().includes('Howard') || chunk.toString().includes('AI Research Laboratory')) {
                console.log('HowardLAB site detected!');
            }
        });
    });

    req.on('error', (e) => {
        console.error('Error:', e);
    });

    req.end();
};

checkDeployment();