require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); 
const authRoutes = require('./routes/auth');
const routeRoutes = require('./routes/routes'); 
const busStopRoutes = require('./routes/busstop'); 
const journeyRoutes = require('./routes/journeys');
const vehicleRoutes = require('./routes/vehicles');
const userRoutes = require('./routes/user');

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/routes', routeRoutes); 
app.use('/api/busstops', busStopRoutes);
app.use('/api/journeys', journeyRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/user', userRoutes);

// Start server - IMPORTANT: Only one app.listen() call!
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
