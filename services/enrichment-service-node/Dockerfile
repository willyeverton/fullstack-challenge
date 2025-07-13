FROM node:20-alpine

WORKDIR /app

# Copy all files
COPY . .

# Expose port
EXPOSE 3000

# Start in development mode (dependencies will be installed via docker-compose command)
CMD ["npm", "run", "start:dev"]
