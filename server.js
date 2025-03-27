const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { SessionsClient } = require('@google-cloud/dialogflow');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(__dirname)); // Serve static files

const sessionClient = new SessionsClient();
const projectId = 'campingbot-fdhn';
const languageCode = 'en';

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // Serve HTML file
});

app.post('/send-message', async (req, res) => {
    const userMessage = req.body.message;
    const sessionId = uuidv4();
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: userMessage,
                languageCode: languageCode,
            },
        },
    };

    try {
        const responses = await sessionClient.detectIntent(request);
        const result = responses[0].queryResult;

        res.json({ reply: result.fulfillmentText });
    } catch (error) {
        console.error('Error communicating with Dialogflow:', error);
        res.status(500).json({ error: 'Failed to get response from Dialogflow' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
