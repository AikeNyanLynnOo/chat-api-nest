# Node version for the application
FROM node:16

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the NestJS application
RUN npm run build

# Expose the application port (assuming default NestJS port)
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/main"]