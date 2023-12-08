import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Main = () => {
    const [originalData, setOriginalData] = useState(null);
    const [transformedData, setTransformedData] = useState(null);
    const [currentView, setCurrentView] = useState('original'); // 'original' or 'transformed'
    const [error, setError] = useState(null);
    const [lotId, setLotId] = useState('');

    useEffect(() => {
        const fetchOriginalData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/connecteur/originalData');
                console.log('Frontend Received Original Data:', response.data);console.log('Original Data:', response.data.data);
                console.log('Transformed Data:', response.data.data);
                
                setOriginalData(response.data.data);
            } catch (error) {
                console.error('Error fetching original data:', error);
            
            }
        };

        const fetchTransformedData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/connecteur/transformedData');
                console.log('Frontend Received Transformed Data:', response.data);console.log('Original Data:', response.data.data);
                console.log('Transformed Data:', response.data.data);
                
                setTransformedData(response.data.data);
            } catch (error) {
                console.error('Error fetching transformed data:', error);
                
            }
        };

        fetchOriginalData();
        fetchTransformedData();
    }, []);

    const handleSubscribe = async () => {
        if (!lotId) {
            alert('Please enter a valid lot ID.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/connecteur/subscribe', {
                lotId: lotId,
                callbackUrl: 'http://backend:5000/connecteur/modificationLot' // Replace with actual callback URL
            });

            console.log('Subscription Response:', response.data);
            alert(`Subscribed to lot ID: ${lotId}`);
        } catch (err) {
            console.error('Error subscribing to lot:', err);
            alert(`Failed to subscribe to lot ID: ${lotId}`);
        }
    };

    const toggleView = (view: React.SetStateAction<string>) => {
        setCurrentView(view);
    }
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
                fontSize: '18px' // increased font size
            }}>
               
                <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
        );
    };

    return (
        <div style={{ 
            padding: '20px', 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontSize: '18px' // increased font size
        }}>
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
                        fontSize: '18px' // increased font size for button
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
                        fontSize: '18px' // increased font size for button
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