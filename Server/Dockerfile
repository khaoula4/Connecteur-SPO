# Choose the Node.js LTS version
FROM node:14 

# Set the working directory in the Docker image
WORKDIR /usr/src/app 

# Copy package.json and package-lock.json to the image
COPY package*.json ./ 

# Install dependencies
RUN npm install 

# Copy the local code to the image
COPY . . 

# Expose the port the app runs on
EXPOSE 5000 

# Command to run the application
CMD [ "node", "server.js" ] 
