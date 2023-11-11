const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

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

const axios = require('axios');
const SPO_URL = 'http://localhost:4000/api/subscribe';  // SPO URL 

axios.post(SPO_URL, { callback: 'http://localhost:5000/connecteur/modificationLot' })
.then(response => {
    console.log('Subscribed to SPO:', response.data.message);
})
.catch(err => {
    console.error('Failed to subscribe to SPO:', err.message);
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
