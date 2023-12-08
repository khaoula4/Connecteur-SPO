const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());


const axios = require('axios');

// async function getKeycloakToken() {
//     const tokenEndpoint = 'http://keycloak:8080/auth/realms/Realme_SPO/protocol/openid-connect/token';
//     const clientID = 'Connector';
//     const clientSecret = 'AiQd3X7lpYRzWXrT0aaT6eAbyEKqFLl7';

//     const params = new URLSearchParams();
//     params.append('grant_type', 'client_credentials');
//     params.append('client_id', clientID);
//     params.append('client_secret', clientSecret);

//     try {
//         const response = await axios.post(tokenEndpoint, params, {
//             headers: {
//                 'Content-Type': 'application/x-www-form-urlencoded'
//             }
//         });
//         return response.data.access_token;
//     } catch (error) {
//         console.error('Error obtaining Keycloak token:', error.response ? error.response.data : error.message);
//         return null;
//     }
    
// }


 
// async function subscribeToSPO() {
//     const token = await getKeycloakToken();
//     if (!token) {
//         console.error('Failed to obtain access token, cannot subscribe to SPO');
//         return;
//     }

//     const SPO_URL = 'http://spo:4000/api/subscribe';
//     axios.post(SPO_URL, { callback: 'http://backend:5000/connecteur/modificationLot' }, {
//         headers: {
//             Authorization: `Bearer ${token}`
//         }
//     })
//     .then(response => {
//         console.log('Subscribed to SPO response:', response);
//     })    
//     .catch(err => {
//         console.error('Failed to subscribe to SPO:', err.message);
//     });
// }

const jwt = require('jsonwebtoken');

const SECRET_KEY = 'SECRET'; // This should be a secure, unpredictable key

// function generateOneTimeToken() {
//     const payload = {
//         batchId: 'batch123', // Example payload data
//         timestamp: Date.now()
//     };

//     const options = {
//         expiresIn: '1h' // Token expires in 1 hour
//     };
//     console.log("Generated Token: ", jwt.sign(payload, SECRET_KEY, options));
//     return jwt.sign(payload, SECRET_KEY, options);
// }

// async function subscribeToSPO() {
//     const token = generateOneTimeToken();

//     const SPO_URL = 'http://spo:4000/api/subscribe';
//     axios.post(SPO_URL, { callback: 'http://backend:5000/connecteur/modificationLot' }, {
//         headers: {
//             Authorization: `Bearer ${token}`
//         }
//     })
//     .then(response => {
//         console.log('Subscribed to SPO response:', response);
//     })    
//     .catch(err => {
//         console.error('Failed to subscribe to SPO:', err.message);
//     });
// }

// Function to generate a unique token for each lot subscription
function generateOneTimeToken(lotId) {
    const payload = {
        lotId: lotId,
        timestamp: Date.now()
    };
    const options = { expiresIn: '1h' }; // Token expires in 1 hour
    return jwt.sign(payload, SECRET_KEY, options);
}

// Function to subscribe to SPO for a specific lot
async function subscribeToSPO(lotId, callbackUrl) {
    const token = generateOneTimeToken(lotId);
    const SPO_URL = 'http://spo:4000/api/subscribe';

    try {
        const response = await axios.post(SPO_URL, { callback: callbackUrl, lotId: lotId }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`Subscribed to SPO for lot ${lotId}, response:`, response.data);
    } catch (err) {
        console.error(`Failed to subscribe to SPO for lot ${lotId}:`, err.message);
    }
}

// Endpoint to initiate subscription for a specific lot
app.post('/connecteur/subscribe', (req, res) => {
    const { lotId, callbackUrl } = req.body;
    if (!lotId || !callbackUrl) {
        return res.status(400).send({ message: 'Lot ID and callback URL are required' });
    }
    subscribeToSPO(lotId, callbackUrl);
    res.status(200).send({ message: `Subscription initiated for lot ${lotId}` });
});




// // Call the function to subscribe
// subscribeToSPO();


let originalDataStorage = {};
let transformedDataStorage = {};

function transformData(data) {
    return {
        ref: data.id,
        operation: `${data.operation.title.split(' ')[3].toUpperCase()}`,
        typeBien: data.typeLot.title.toUpperCase(),
        expositions: data.expositionPrincipale.title.split(" ")[1].split("-").map(str => str.trim().toUpperCase()),
        tantiemes: data.tantiemes,
        surfaceHabitable: data.surface,
        prixAnnonceHT: data.prixCommercialHT,
        adresse: {
            ligne1: `${data.adresse.numVoie} ${data.adresse.complement ? data.adresse.complement + ',' : ''} ${data.adresse.nomVoie}`,
            cp: data.adresse.codePostal,
            commune: data.adresse.ville
        },
        balcons: [
            {
                surfaceTotale: data.surfaceBalcon,
                exposition: data.expositionPrincipale.title.split(" ")[1].split("-")[0].trim().toUpperCase()
            }
        ]
    };
}


app.post('/connecteur/modificationLot', (req, res) => {
    const receivedData = req.body;
    console.log('Backend Received Data:', receivedData);

    // Store original data
    originalDataStorage = receivedData;
    
    // Transform and store transformed data
    transformedDataStorage = transformData(receivedData);

    res.status(200).json({
        message: 'Data received and transformed successfully',
        originalData: originalDataStorage,
        transformedData: transformedDataStorage
    });
});



app.get('/connecteur/originalData', (req, res) => {
    console.log('Backend Sent Original Data:', originalDataStorage);
    res.status(200).json({
        message: 'Original Data sent successfully',
        data: originalDataStorage
    });
});

app.get('/connecteur/transformedData', (req, res) => {
    console.log('Backend Sent Transformed Data:', transformedDataStorage);
    res.status(200).json({
        message: 'Transformed Data sent successfully',
        data: transformedDataStorage
    });
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});