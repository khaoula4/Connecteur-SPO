const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

let receivedDataStorage = {};

app.post('/connecteur/modificationLot', (req, res) => {
    const receivedData = req.body;
    console.log('Backend Received Data:', receivedData);

    // Store received data in memory
    receivedDataStorage = receivedData;

    res.status(200).json({
        message: 'Data received successfully',
        receivedData 
    });
});

app.get('/connecteur/modificationLot', (req, res) => {
    console.log('Backend Sent Data:', receivedDataStorage);
    // Send stored data to the frontend
    res.status(200).json({
        message: 'Data sent successfully',
        sentData: receivedDataStorage
    });
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
