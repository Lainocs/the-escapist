# Use the official Node.js image as the base image
FROM node:22.10.0

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json ./
COPY yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN yarn build

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the app
CMD ["node", "build/main.js"]