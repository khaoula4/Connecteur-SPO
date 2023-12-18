# Connecteur-SPO


## Overview
The Connecteur-SPO is middleware designed to facilitate real-time data transformation and transfer from SPO to CRM systems or frontend interfaces. This project emphasizes robust authentication mechanisms to secure data flow, implementing strategies such as Keycloak, JWT one-time use tokens, and lot-specific authentication to meet diverse operational needs.

## Branches Overview

### Master Branch
- Basic JSON processing and transformation.
- Initial webhook setup for communication with SPO.

### Ajout-Keycloak Branch
- Integration of Keycloak for secure authentication using Bearer tokens.
- Enhanced security in communication with SPO.

### OneTimeToken Branch
- Implementation of JWT for one-time use tokens.
- Improved security with a no token reused.

### OneTimeTokenPerLot Branch
- Unique authentication per lot for targeted subscription.
- Fine-grained access control and security.

## Main Component of the Front End :
The Main component is a crucial part of the front end that is common across all branches of the Connector project. It displays both the original and transformed data fetched from the Connector.

###  Key Functionalities
###  State Management
- originalData: Stores the original data fetched from the backend.
- transformedData: Holds the transformed data.
- currentView: Tracks whether 'original' or 'transformed' data is being displayed.
- error: Captures any errors during data fetching.
  
###  Data Fetching
- Utilizes useEffect to fetch data when the component mounts.
- fetchOriginalData(): Asynchronously retrieves and sets the original data.
- fetchTransformedData(): Asynchronously retrieves and sets the transformed data.
- Implements error handling within the data fetching functions.
  
###  User Interaction
- toggleView(): Allows users to switch between the original and transformed data views.
- Provides interactive buttons for users to select the data they wish to view.
  
###  Data Display
- Uses the Card component for presenting the data.
- Employs conditional rendering to show a loading message or an error notification based on the data fetching status.
  
###  TypeScript Interfaces
- Defines interfaces like Address, Link, and Data for structured data management and ensuring type safety.
  
###  Rendering and Styling
- Renders a user interface with toggling buttons and displays the relevant data.
- Applies inline styling for various UI elements, enhancing the visual appeal and user experience.

## Connector Server :

This documentation provides an overview of the different connectors used in the project, each employing a unique authentication strategy to securely interact with (SPO) service, and each in a different branch.

### Keycloak Connector (Ajout-Keycloak Branch)

#### Overview
The Keycloak Connector uses Keycloak for authentication, ensuring secure communication with the SPO service through Bearer tokens.

#### Key Functions
- **getKeycloakToken()**: Retrieves an access token from Keycloak using client credentials.
- **subscribeToSPO()**: Subscribes to the SPO service with the Keycloak token and handles subscription responses.

 ### OneTimeToken Connector (OneTimeToken Branch)

#### Overview
Employs JWTs for one-time use, enhancing security by no risk of token reuse.

#### Key Functions
- **generateOneTimeToken()**: Creates a JWT valid for a single transaction/session.
- **subscribeToSPO()**: Subscribes to the SPO service using the JWT and logs the subscription details.

### OneTimeTokenPerLot Connector (OneTimeTokenPerLot Branch)

#### Overview
This Connector uses unique authentication for each lot, enhancing security and providing targeted access.

#### Key Functions
- **generateOneTimeToken**: Generates a one-time use token for each lot subscription.
- **subscribeToSPO**: Manages subscriptions to the SPO service for specific lots using the generated tokens.

#### Endpoint
- **/connecteur/subscribe**: Endpoint to initiate subscriptions for specific lots, requiring lot ID and callback URL.
  
### Commun Endpoints
- **/connecteur/modificationLot**: Handles lot modification notifications.
- **/connecteur/originalData**: Endpoint for retrieving original data.
- **/connecteur/transformedData**: Endpoint for retrieving transformed data.

  ## SPO Service:

This document provides an overview of the different versions of the Service Provider Operation (SPO) service, each employing a distinct authentication strategy to manage subscriptions and notify subscribers of lot status updates. These versions are implemented in separate branches of the project.

### SPO with OneTimeToken Authentication (OneTimeToken Branch)

#### Overview
This version uses JWT (JSON Web Token) for one-time token authentication, enhancing security by preventing token reuse.

#### Key Features
- **isTokenUsed(token)**: Checks if a token has already been used.
- **validateToken(token)**: Validates JWT tokens and ensures they are used only once.
- **/api/subscribe**: Manages subscription requests and adds subscribers after successful token validation.
- **/api/lots/update-status**: Notifies all subscribers when the status of a lot changes to "Achevé de construire".

### SPO with OneTimeTokenPerLot Authentication (OneTimeTokenPerLot Branch)

#### Overview
This variant uses unique JWT tokens generated for each specific lot, providing more granular control over subscriptions.

#### Key Features
- **validateToken(token)**: Validates tokens based on the lot ID encoded within them.
- **/api/subscribe**: Manages subscriptions for individual lots based on lot-specific tokens.
- **/api/lots/update-status**: Sends notifications only to subscribers of a specific lot when its status is updated.

### SPO with Keycloak Authentication (Keycloak Branch)

#### Overview
This version integrates Keycloak for robust authentication, leveraging Keycloak's identity and access management features.

#### Key Features
- **Keycloak Integration**: Uses Keycloak-connect to manage access and protect routes.
- **/api/subscribe**: Ensures that only authenticated requests can subscribe to notifications.
- **/api/lots/update-status**: Notifies all subscribers when a lot's status changes to "Achevé de construire".

### Common Features Across All Versions

#### Health Check Endpoint
- **/health**: Provides a status check of the SPO service.

## Docker and Docker Compose Configurations

This section covers the Docker and Docker Compose configurations for the front end, connectors, and the SPO service in the project.

### Front End Dockerfile

#### Configuration
- **Base Image**: `node:14`
- **Working Directory**: Set to `/usr/src/app`.
- **Dependencies**: Installed via `npm install`.
- **Port**: Exposes `3000`.
- **Startup Command**: Uses `npm start` to launch the application.

### Connector Dockerfile

#### Configuration
- **Base Image**: `node:14`
- **Working Directory**: Set to `/usr/src/app`.
- **Script**: Includes `wait-for-keycloak.sh` for Keycloak integration.
- **Port**: Exposes `5000`.
- **Startup Command**: Executes `wait-for-keycloak.sh` followed by `node server.js`.

### SPO Service Dockerfile

#### Configuration
- **Base Image**: `node:14`
- **Working Directory**: Set to `/usr/src/app`.
- **Dependencies**: Installed as needed.
- **Port**: Exposes `4000`.
- **Startup Command**: Runs the main application file (`Main.js`).
- 
### Docker Compose Configurations

### Ajout-Keycloak Branch

#### Services Configuration
- **Keycloak**: Configured with admin credentials, exposed on port `8080`, and includes health checks and data persistence volume.
- **SPO Service**: Built from `./SPO-Simul` with health checks, exposed on port `4000`, and depends on Keycloak.
- **Backend (Connector)**: Built from `./Server`, exposed on port `5000`, and depends on both SPO and Keycloak.
- **Frontend**: Built from `./front`, exposed on port `3000`, and depends on Backend and Keycloak.

#### Volume
- **keycloak_data**: For Keycloak data persistence.

### OneTimeToken and OneTimeTokenPerLot Branches

These branches share a similar Docker Compose configuration.

#### Services Configuration
- **SPO Service**: Built from `./SPO-Simul` directory, exposed on port `4000`, with regular health checks.
- **Backend (Connector)**: Built from `./Server`, exposed on port `5000`, and depends on the SPO service.
- **Frontend**: Built from `./front`, exposed on port `3000`, and depends on the Backend service.
