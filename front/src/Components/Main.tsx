import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../App.css';
// Main component
const Main = () => {
    // State hooks for storing data and UI state
    const [originalData, setOriginalData] = useState(null); // State for storing original data
    const [transformedData, setTransformedData] = useState(null); // State for storing transformed data
    const [currentView, setCurrentView] = useState('original'); // State to track which view (original or transformed) is currently active
    const [error, setError] = useState(null); // State to store any error messages

    // useEffect hook to fetch data on component mount
    useEffect(() => {
        // Function to fetch original data from backend
        const fetchOriginalData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/connecteur/originalData');
                // Logging and setting state with fetched data
                console.log('Frontend Received Original Data:', response.data);
                setOriginalData(response.data.data);
            } catch (error) {
                // Handling errors in fetching data
                console.error('Error fetching original data:', error);
               
            }
        };

        // Function to fetch transformed data from backend
        const fetchTransformedData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/connecteur/transformedData');
                // Logging and setting state with fetched data
                console.log('Frontend Received Transformed Data:', response.data);
                setTransformedData(response.data.data);
            } catch (error) {
                // Handling errors in fetching data
                console.error('Error fetching transformed data:', error);
                
            }
        };

        // Calling the data fetching functions
        fetchOriginalData();
        fetchTransformedData();
    }, []); // Empty dependency array to ensure this effect runs only once on mount

    // Function to toggle between original and transformed data views
    const toggleView = (view: React.SetStateAction<string>) => {
        setCurrentView(view);
    };

    // TypeScript interfaces for type checking
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
     // Component to render a data card
    const Card: React.FC<{ data: Data | null }> = ({ data }) => {
        if (!data) return <p>Loading data...</p>;// Display loading text if data is not yet available

        // Render the data in a formatted JSON view

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
    // Main component return statement
    return (
        <div style={{ 
            padding: '20px', 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontSize: '18px' 
        }}>
            <h2 style={{ fontSize: '30px' , color: 'gray'}}>Connector-SPO</h2>
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
                        fontSize: '20px' 
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