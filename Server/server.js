const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());


const axios = require('axios');

async function getKeycloakToken() {
    const tokenEndpoint = 'http://keycloak:8080/auth/realms/Realme_SPO/protocol/openid-connect/token';
    const clientID = 'Connector';
    const clientSecret = 'AiQd3X7lpYRzWXrT0aaT6eAbyEKqFLl7';

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', clientID);
    params.append('client_secret', clientSecret);

    try {
        const response = await axios.post(tokenEndpoint, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Error obtaining Keycloak token:', error.response ? error.response.data : error.message);
        return null;
    }
    
}

async function subscribeToSPO() {
    const token = await getKeycloakToken();
    if (!token) {
        console.error('Failed to obtain access token, cannot subscribe to SPO');
        return;
    }

    const SPO_URL = 'http://spo:4000/api/subscribe';
    axios.post(SPO_URL, { callback: 'http://backend:5000/connecteur/modificationLot' }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    .then(response => {
        console.log('Subscribed to SPO response:', response);
    })    
    .catch(err => {
        console.error('Failed to subscribe to SPO:', err.message);
    });
}

// Call the function to subscribe
subscribeToSPO();


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
