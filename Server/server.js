const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());



const axios = require('axios');

// Function to obtain an access token from Keycloak
async function getKeycloakToken() {
    // Keycloak token endpoint and client credentials
    const tokenEndpoint = 'http://keycloak:8080/auth/realms/Realme_SPO/protocol/openid-connect/token';
    const clientID = 'Connector';
    const clientSecret = 'AiQd3X7lpYRzWXrT0aaT6eAbyEKqFLl7';

    // Preparing request parameters
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', clientID);
    params.append('client_secret', clientSecret);

    try {
        // Requesting access token from Keycloak
        const response = await axios.post(tokenEndpoint, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return response.data.access_token; // Returning the access token
    } catch (error) {
        // Logging error if token request fails
        console.error('Error obtaining Keycloak token:', error.response ? error.response.data : error.message);
        return null;
    }
}

// Function to subscribe to the SPO service
async function subscribeToSPO() {
    // Getting the Keycloak token
    const token = await getKeycloakToken();
    if (!token) {
        console.error('Failed to obtain access token, cannot subscribe to SPO');
        return;
    }

    // SPO service URL
    const SPO_URL = 'http://spo:4000/api/subscribe';

    // Subscribing to the SPO service with the access token
    axios.post(SPO_URL, { callback: 'http://backend:5000/connecteur/modificationLot' }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    .then(response => {
        // Logging successful subscription
        console.log('Subscribed to SPO response:', response.data);
    })    
    .catch(err => {
        // Logging error if subscription fails
        console.error('Failed to subscribe to SPO:', err.message);
    });
}

// Call the function to subscribe to the SPO service
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
  
    res.status(200).json({
        message: 'Original Data sent successfully',
        data: originalDataStorage
    });
});

app.get('/connecteur/transformedData', (req, res) => {
 
    res.status(200).json({
        message: 'Transformed Data sent successfully',
        data: transformedDataStorage
    });
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
