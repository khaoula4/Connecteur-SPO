const express = require('express');
const cors = require('cors');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = 5000;


app.use(cors());
app.use(express.json());

// Secret key for JWT token generation
const SECRET_KEY = 'SECRET'; 

// Function to generate a one-time JWT token
function generateOneTimeToken() {
    const payload = { batchId: 'batch123', timestamp: Date.now() };
    const options = { expiresIn: '1h' };
    return jwt.sign(payload, SECRET_KEY, options);
}

// Function to subscribe to SPO
async function subscribeToSPO() {
    const token = generateOneTimeToken();
    const SPO_URL = 'http://spo:4000/api/subscribe';
    try {
        const response = await axios.post(SPO_URL, { callback: 'http://backend:5000/connecteur/modificationLot' }, {
            headers: { Authorization:  token }
        });
        console.log('Subscribed to SPO response:', response.data);
    } catch (err) {
        console.error('Failed to subscribe to SPO:', err.message);
    }
}


// Automatically call the function to subscribe when the server starts
subscribeToSPO();


let originalDataStorage = {};
let transformedDataStorage = {};

// Function to transform received data

function transformData(data) {
    // Transform and return the data in the desired format
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


// Endpoint to handle lot modification notifications
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


// Endpoint to retrieve original data
app.get('/connecteur/originalData', (req, res) => {
  
    res.status(200).json({
        message: 'Original Data sent successfully',
        data: originalDataStorage
    });
});

// Endpoint to retrieve transformed data
app.get('/connecteur/transformedData', (req, res) => {
 
    res.status(200).json({
        message: 'Transformed Data sent successfully',
        data: transformedDataStorage
    });
});

// Start the server
app.listen(5000, () => {
    console.log(`Connector is running on port ${PORT}`);
});