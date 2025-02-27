# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory
WORKDIR /client

# Install build dependencies (make, gcc, g++, python) for native module compilation
RUN apk add --no-cache make gcc g++ python3

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies and allow legacy peer dependencies
RUN npm install --legacy-peer-deps

# Rebuild native modules like bcrypt to ensure they work inside the container
RUN npm rebuild bcrypt --build-from-source

# Copy the rest of the application files
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the Next.js port
EXPOSE 3000

# Use a production-ready command to start the app
CMD ["npm", "run", "start"]



# # client/Dockerfile
# FROM node:18-alpine

# WORKDIR /client

# COPY package*.json ./

# RUN npm install --legacy-peer-deps

# COPY . .

# # Build the Next.js application
# RUN npm run build

# EXPOSE 3000

# CMD ["npm", "run","dev"]