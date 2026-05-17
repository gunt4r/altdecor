# Step 1: Use an official Node.js image to build the Angular app
FROM node:18 AS build

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the Angular application in production mode
RUN npm run build:prod

# Step 2: Set up the nginx server to serve the app
FROM nginx:alpine

# Copy the built app from the previous step to the nginx html directory
COPY --from=build /app/dist/zipFlow/browser /usr/share/nginx/html

# Expose port 80 to access the app
EXPOSE 80

# Start the nginx server
CMD ["nginx", "-g", "daemon off;"]
