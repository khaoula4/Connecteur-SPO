const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = 4000;

// Array to store the subscribers' callback URLs
let subscribers = [];

// Array to store used tokens to prevent reuse
let usedTokens = []; 

app.use(express.json());

// Function to check if a token has already been used
function isTokenUsed(token) {
    return usedTokens.includes(token);
}
// Function to validate the JWT token
function validateToken(token) {
    
    try {
        // Verify the token with the secret key
        const decoded = jwt.verify(token, 'SECRET');
        if (isTokenUsed(token)) {
            console.error('Token already used');
            return null;
        }
        usedTokens.push(token); // Mark the token as used
        return decoded; // or return decoded.lotId 
    } catch (error) {
        console.error('Token validation error:', error.message);
        return null;
    }
}
// Endpoint to handle subscription requests
app.post('/api/subscribe', (req, res) => {
    const token = req.headers['authorization'];
    const decodedToken = validateToken(token);
    if (decodedToken) {
        const callbackUrl = req.body.callback;
        if (callbackUrl) {
             // Add the callback URL to the subscribers list
            subscribers.push(callbackUrl);
            res.status(200).send({ message: 'Subscription successful.' });
        } else {
            res.status(400).send({ message: 'Invalid subscription request.' });
        }
    } else {
        res.status(401).send({ message: 'Invalid or expired token.' });
    }
});

app.post('/api/lots/update-status', (req, res) => {
    const lotData = req.body;
    const status = lotData.statutLot.title;

    if (status === "Achevé de construire") {
        // Notify all subscribers about the lot status update
        subscribers.forEach(callbackUrl => {
            axios.post(callbackUrl, lotData)
                .catch(err => {
                    console.error(`Failed to notify subscriber ${callbackUrl}: ${err.message}`);
                });
        });
        res.status(200).send({ message: 'Lot status is "Achevé de construire", and notifications have been sent.' });
    } else {
        res.status(200).send({ message: 'Lot status updated but no notifications were sent due to status mismatch.' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send({ status: 'Healthy' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`SPO is running on port ${PORT}`);
});
