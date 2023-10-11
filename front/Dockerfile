# Use the official image from the create-react-app build
FROM node:14

# Set the working directory in Docker
WORKDIR /usr/src/app

# Copy all files to the image
COPY . . 

# Install dependencies
RUN npm install

# Expose the port the app runs on
EXPOSE 3000 

# Start the app
CMD ["npm", "start"]
