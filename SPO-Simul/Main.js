const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 4000;
app.use(express.json());

let subscribers = {};



// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send({ status: 'Healthy' });
});

// Function to validate JWT tokens
function validateToken(token) {
    try {
        // Verifying the token and returning the decoded lotId
        const decoded = jwt.verify(token, 'SECRET'); 
        return decoded.lotId;
    } catch (error) {
       
        console.error('Token validation error:', error.message);
        return null;
    }
}

// Endpoint to subscribe to notifications
app.post('/api/subscribe', (req, res) => {

    const token = req.headers['authorization'];
   
    const lotId = validateToken(token);

    if (lotId) {
        // Getting callback URL from the request body
        const callbackUrl = req.body.callback;
        if (callbackUrl) {
            // If the lotId is not already subscribed, initialize an array
            if (!subscribers[lotId]) {
                subscribers[lotId] = [];
            }
            // Adding the callback URL to the subscribers list for the lotId
            subscribers[lotId].push(callbackUrl);
           
            res.status(200).send({ message: `Subscription successful for lot ${lotId}.` });
        } else {
          
            res.status(400).send({ message: 'Invalid subscription request: callback URL is required.' });
        }
    } else {
       
        res.status(401).send({ message: 'Invalid or expired token.' });
    }
});

// Endpoint to update lot status
app.post('/api/lots/update-status', (req, res) => {
    // Extracting lot data from the request body
    const lotData = req.body;
    const lotId = lotData.id;
    const status = lotData.statutLot.title;

 
    if (status === "Achevé de construire" && subscribers[lotId]) {
        // Notifying all subscribers
        subscribers[lotId].forEach(callbackUrl => {
            axios.post(callbackUrl, lotData)
            .catch(err => {
                // Logging errors in notifying subscribers
                console.error(`Failed to notify subscriber ${callbackUrl}: ${err.message}`);
            });
        });
       
        res.status(200).send({ message: `Notifications sent for lot ${lotId} status update.` });
    } else {
        
        res.status(200).send({ message: 'No notifications sent due to status mismatch or no subscribers for this lot.' });
    }
});


app.listen(PORT, () => {
    console.log(`SPO service running on port ${PORT}`);
});
