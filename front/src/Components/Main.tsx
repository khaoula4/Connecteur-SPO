import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Main = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/connecteur/modificationLot');
                console.log('Frontend Received Data:', response.data);
                setData(response.data.sentData);  
            } catch (error) {
                console.error('Error fetching data:', error);
               
            }
        };
        fetchData();
    }, []);

    return (
        <div>
            <h1>Received Data:</h1>
            {error ? (
                <p>Error fetching data: </p>
            ) : (
                <pre>{JSON.stringify(data, null, 2)}</pre>
            )}
        </div>
    );
};

export default Main;
