FROM node:20-alpine

WORKDIR /app

# Copy only package files first for better caching
COPY package*.json ./

# Install dependencies first (cached layer)
RUN npm install

# Then copy the rest (this layer will be mostly overridden by volume mount)
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]