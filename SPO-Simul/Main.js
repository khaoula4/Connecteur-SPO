const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 4000;
const session = require('express-session');
const Keycloak = require('keycloak-connect');

let subscribers = [];

app.use(express.json());




app.post('/api/subscribe', (req, res) => {
    const callbackUrl = req.body.callback;
    if(callbackUrl) {
        subscribers.push(callbackUrl);
        res.status(200).send({ message: 'Subscription successful.' });
    } else {
        res.status(400).send({ message: 'Invalid subscription request.' });
    }
});

app.post('/api/lots/update-status', (req, res) => {
    const lotData = req.body;
    const status = lotData.statutLot.title;

    if (status === "Achevé de construire") {
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




app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

