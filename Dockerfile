# Use Node.js version 20.15.0 as a parent image
FROM node:20.15.0

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the TypeScript project
RUN npm run build

# Expose the port your app runs on (adjust if necessary)
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
