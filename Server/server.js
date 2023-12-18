const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());


const axios = require('axios');



 
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'SECRET'; 

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
            headers: { Authorization: token}
        });
        console.log(`Subscribed to SPO for lot ${lotId}`);
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