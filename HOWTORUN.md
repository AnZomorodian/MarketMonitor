# How to Run - MarketPulse

A real-time price dashboard for cryptocurrencies, gold, and currencies using the Baha24 API.

## Prerequisites

- Node.js (v20 or higher)
- npm (v10 or higher)

## Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Application**
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:5000`

## Production Build

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Start Production Server**
   ```bash
   npm start
   ```

## Docker Deployment

1. **Create a Dockerfile**
   ```dockerfile
   FROM node:20-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 5000
   CMD ["npm", "start"]
   ```

2. **Build and Run**
   ```bash
   docker build -t marketpulse .
   docker run -p 5000:5000 marketpulse
   ```

## API Source

- All market data is fetched from the **Baha24 API** (`https://baha24.com/api/v1/price`)
- Data includes: Cryptocurrencies, Gold & Coins (Iranian), and World Currencies
- Prices are cached for 5 minutes before refreshing

## Features

- Real-time cryptocurrency prices (Bitcoin, Ethereum, etc.)
- Gold and Iranian coin prices (18k gold, Emami coin, etc.)
- World currency exchange rates (USD, EUR, GBP, etc.)
- Auto-refresh every 5 minutes
- Dark theme financial dashboard

## Contact

- Built by Artin Zomorodian
- Telegram: https://t.me/ArtinZomorodian
- Website: https://DeepInkteam.com
