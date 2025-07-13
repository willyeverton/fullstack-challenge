FROM node:18-alpine

# Install dependencies for DNS resolution
RUN apk add --no-cache curl

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all files
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 80

# Start application
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "80"]
