// const express = require('express');
// const axios = require('axios');
// const Keycloak = require('keycloak-connect');

// const app = express();
// const PORT = 4000;

// // // Configuration de Keycloak pour le mode Bearer-Only
// // const keycloakConfig = {
// //     "realm": "Realme_SPO",
// //     "auth-server-url": "http://keycloak:8080/auth/",
// //     "resource": "SPO",
// //     "bearer-only": true, // Activer le mode Bearer-Only
// //     "ssl-required": "external",
// //     "credentials": {
// //         "secret": "TinzsZu6jY84l56OYL1RsIYwlbhMqXEx"
// //     },
// //     "confidential-port": 0
// // };

// // let keycloak = new Keycloak({}, keycloakConfig);

// let subscribers = {};

// app.use(express.json());

// // // Middleware de Keycloak pour protéger les routes
// // app.use(keycloak.middleware());

// app.get('/health', (req, res) => {
//     res.status(200).send({ status: 'Healthy' });
// });

// // // Protéger la route avec Keycloak
// // app.post('/api/subscribe', keycloak.protect('subscribe'), (req, res) => {
// //     const callbackUrl = req.body.callback;
// //     if (callbackUrl) {
// //         subscribers.push(callbackUrl);
// //         res.status(200).send({ message: 'Subscription successful.' });
// //     } else {
// //         res.status(400).send({ message: 'Invalid subscription request.' });
// //     }
// // });

// const jwt = require('jsonwebtoken');

// function validateToken(token) {
//     try {
//         token = token.startsWith('Bearer ') ? token.slice(7) : token;
//         const decoded = jwt.verify(token, 'SECRET');
//         return decoded.lotId;
//     } catch (error) {
//         console.error('Token validation error:', error.message);
//         return null;
//     }
// }

// app.post('/api/subscribe', (req, res) => {
//     const token = req.headers['authorization'];
//     const lotId = validateToken(token);

//     if (lotId) {
//         const callbackUrl = req.body.callback;
//         if (!subscribers[lotId]) {
//             subscribers[lotId] = [];
//         }
//         subscribers[lotId].push(callbackUrl);
//         res.status(200).send({ message: `Subscription successful for lot ${lotId}.` });
//     } else {
//         res.status(401).send({ message: 'Invalid or expired token.' });
//     }
// });

// app.post('/api/lots/update-status', (req, res) => {
//     const lotData = req.body;
//     const lotId = lotData.lotId;
//     const status = lotData.statutLot.title;

//     if (status === "Achevé de construire" && subscribers[lotId]) {
//         subscribers[lotId].forEach(callbackUrl => {
//             axios.post(callbackUrl, lotData)
//             .catch(err => {
//                 console.error(`Failed to notify subscriber ${callbackUrl}: ${err.message}`);
//             });
//         });
//         res.status(200).send({ message: 'Notifications sent for lot status update.' });
//     } else {
//         res.status(200).send({ message: 'No notifications sent due to status mismatch or no subscribers.' });
//     }
// });

// // function validateToken(token) {
// //     // Strip 'Bearer ' prefix if present
// //     token = token.startsWith('Bearer ') ? token.slice(7) : token;

// //     try {
// //         const decoded = jwt.verify(token, 'SECRET');
// //         // Additional validation logic here
// //         return true;
// //     } catch (error) {
// //         console.error('Detailed Token Error: ', error);
// //         return false;
// //     }
// // }
// // app.post('/api/subscribe', (req, res) => {
// //     const token = req.headers['authorization']; // or req.body.token
// //     if (validateToken(token)) {
// //         const callbackUrl = req.body.callback;
// //         if (callbackUrl) {
// //             subscribers.push(callbackUrl);
// //             // invalidateToken(token); // Remove or comment out this line
// //             res.status(200).send({ message: 'Subscription successful.' });
// //         } else {
// //             res.status(400).send({ message: 'Invalid subscription request.' });
// //         }
// //     } else {
// //         res.status(401).send({ message: 'Invalid or expired token.' });
// //     }
// // });


// // app.post('/api/lots/update-status', (req, res) => {
// //     const lotData = req.body;
// //     const status = lotData.statutLot.title;

// //     if (status === "Achevé de construire") {
// //         subscribers.forEach(callbackUrl => {
// //             axios.post(callbackUrl, lotData)
// //             .catch(err => {
// //                 console.error(`Failed to notify subscriber ${callbackUrl}: ${err.message}`);
// //             });
// //         });
        
// //         res.status(200).send({ message: 'Lot status is "Achevé de construire", and notifications have been sent.' });
// //     } else {
// //         res.status(200).send({ message: 'Lot status updated but no notifications were sent due to status mismatch.' });
// //     }
// // });




// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });

const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 4000;

let subscribers = {};

app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).send({ status: 'Healthy' });
});

function validateToken(token) {
    try {
        token = token.startsWith('Bearer ') ? token.slice(7) : token;
        const decoded = jwt.verify(token, 'SECRET'); // Ensure the SECRET is the same used in the Connector service
        return decoded.lotId;
    } catch (error) {
        console.error('Token validation error:', error.message);
        return null;
    }
}

app.post('/api/subscribe', (req, res) => {
    const token = req.headers['authorization'];
    const lotId = validateToken(token);

    if (lotId) {
        const callbackUrl = req.body.callback;
        if (callbackUrl) {
            if (!subscribers[lotId]) {
                subscribers[lotId] = [];
            }
            subscribers[lotId].push(callbackUrl);
            res.status(200).send({ message: `Subscription successful for lot ${lotId}.` });
        } else {
            res.status(400).send({ message: 'Invalid subscription request: callback URL is required.' });
        }
    } else {
        res.status(401).send({ message: 'Invalid or expired token.' });
    }
});

app.post('/api/lots/update-status', (req, res) => {
    const lotData = req.body;
    const lotId = lotData.id;
    const status = lotData.statutLot.title;

     console.log('le lot id est ' ,lotId);

    if (status === "Achevé de construire" && subscribers[lotId]) {
        subscribers[lotId].forEach(callbackUrl => {
            axios.post(callbackUrl, lotData)
            .catch(err => {
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
