const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 4000;

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
   
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

