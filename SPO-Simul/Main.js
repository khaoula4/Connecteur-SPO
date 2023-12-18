const express = require('express');
const axios = require('axios');
const Keycloak = require('keycloak-connect');

const app = express();
const PORT = 4000;

// Configuration de Keycloak pour le mode Bearer-Only
const keycloakConfig = {
    "realm": "Realme_SPO",
    "auth-server-url": "http://keycloak:8080/auth/",
    "resource": "SPO",
    "bearer-only": true, 
    "ssl-required": "external",
    "credentials": {
        "secret": "TinzsZu6jY84l56OYL1RsIYwlbhMqXEx"
    },
    "confidential-port": 0
};

let keycloak = new Keycloak({}, keycloakConfig);

let subscribers = [];

app.use(express.json());

// Middleware de Keycloak pour protéger les routes
app.use(keycloak.middleware());

app.get('/health', (req, res) => {
    res.status(200).send({ status: 'Healthy' });
});

// Protéger la route avec Keycloak
app.post('/api/subscribe', keycloak.protect('subscribe'), (req, res) => {
    const callbackUrl = req.body.callback;
    if (callbackUrl) {
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

