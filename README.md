# Stock Trading Backend

## Description
This project is a backend system for managing stock trades, handling both FIFO and LIFO lot management strategies.  
It allows trade entry, automatic lot creation, and proper realization of trades while following efficient REST principles.

## Features
- Create, read, and bulk upload trades.
- Create and update stock lots automatically.
- Handle both FIFO and LIFO realization for sell trades.
- API endpoints for fetching trades and lots.
- Proper error handling and validations.

## Steps For Setup

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/stock-trading-backend.git
cd stock-trading-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory and add the following:
```env
PORT=5000
MONGO_URI=mongodb+srv://yourusername:yourpassword@yourcluster.mongodb.net/
```

### 4. Start the server
```bash
npm run dev
```

The server will start at [http://localhost:5000](http://localhost:5000).

