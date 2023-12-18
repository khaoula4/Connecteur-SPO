import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../App.css';

const Main = () => {
    // State hooks for managing component state
    const [originalData, setOriginalData] = useState(null); // State to store original data
    const [transformedData, setTransformedData] = useState(null); // State to store transformed data
    const [currentView, setCurrentView] = useState('original'); // State to track current view ('original' or 'transformed')
    const [error, setError] = useState(null); // State to store any error messages
    const [lotId, setLotId] = useState(''); // State to store the lot ID for subscription

    // useEffect hook to fetch data when component mounts
    useEffect(() => {
        // Async function to fetch original data from backend
        const fetchOriginalData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/connecteur/originalData');
                setOriginalData(response.data.data); // Storing fetched data in state
            } catch (error) {
               
            }
        };

        // Async function to fetch transformed data from backend
        const fetchTransformedData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/connecteur/transformedData');
                setTransformedData(response.data.data); // Storing fetched data in state
            } catch (error) {
             
            }
        };

        // Calling the fetch functions
        fetchOriginalData();
        fetchTransformedData();
    }, []);

    // Function to handle subscription to a lot
    const handleSubscribe = async () => {
        if (!lotId) {
            alert('Please enter a valid lot ID.'); // Alert if lot ID is empty
            return;
        }

        try {
            // Sending subscription request to the backend
            const response = await axios.post('http://localhost:5000/connecteur/subscribe', {
                lotId: lotId,
                callbackUrl: 'http://backend:5000/connecteur/modificationLot'
            });
            alert(`Subscribed to lot ID: ${lotId}`); // Alert on successful subscription
        } catch (err) {
            alert(`Failed to subscribe to lot ID: ${lotId}`); // Alert on subscription failure
        }
    };

    // Function to toggle between original and transformed data views
    const toggleView = (view: React.SetStateAction<string>) => {
        setCurrentView(view);
    };

    // TypeScript interfaces for type checking the data structure
    interface Address {
        numVoie: string;
        complement?: string;
        nomVoie: string;
        codePostal: string;
        ville: string;
    }
    
    interface Link {
        rel: string;
        href: string;
        title: string;
    }
    
    interface Data {
        id: string;
        links: Link[];
        trancheCommerciale: Link;
        operation: Link;
        numero: string;
        typeLot: Link;
        expositionPrincipale: Link;
        tantiemes: number;
        statutLot: Link;
        surface: number;
        prixCommercialHT: number;
        dateAchevement: string;
        adresse: Address;
        surfaceBalcon: number;
        surfaceTerrasse: number;
        surfaceCave: number;
        surfaceGarage: number;
    }
    
    const Card: React.FC<{ data: Data | null }> = ({ data }) => {
        if (!data) return <p>Loading data...</p>;

        return (
            <div style={{ 
                border: '1px solid #ccc',
                padding: '20px', 
                borderRadius: '8px', 
                marginBottom: '20px', 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                fontSize: '18px' 
            }}>
               
                <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
        );
    };

// Main render function of the component
    return (
        <div style={{ 
            padding: '20px', 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontSize: '18px' 
        }}>
             <h1 style={{ fontSize: '30px' }}>Connector-SPO</h1>
          <div style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    value={lotId}
                    onChange={(e) => setLotId(e.target.value)}
                    placeholder="Enter Lot ID"
                    style={{ padding: '10px', marginRight: '10px' }}
                />
                <button
                    onClick={handleSubscribe}
                    style={{
                        backgroundColor: '#FF5722',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '18px'
                    }}
                >
                    Subscribe to Lot
                </button>
            </div>
            <h1 style={{ fontSize: '24px' }}>Lot's Data</h1>
            <div style={{ marginBottom: '20px', display: 'flex' }}>
                <button 
                    onClick={() => toggleView('original')}
                    style={{
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                        marginRight: '10px',
                        fontSize: '18px' 
                    }}
                >
                    Original Data
                </button>
                <button 
                    onClick={() => toggleView('transformed')}
                    style={{
                        backgroundColor: '#008CBA',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '18px' 
                    }}
                >
                    Transformed Data
                </button>
            </div>
            {error ? (
                <p style={{ color: 'red' }}>Error fetching data: {error}</p>
            ) : (
                <Card data={currentView === 'original' ? originalData : transformedData} />
            )}
        </div>
    );
};

export default Main;