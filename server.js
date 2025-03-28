const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { SessionsClient } = require('@google-cloud/dialogflow');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(__dirname));

const sessionClient = new SessionsClient({ keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS });
const projectId = process.env.DIALOGFLOW_PROJECT_ID || 'campingbot-fdhn';
const languageCode = 'en';

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
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

module.exports = app;
