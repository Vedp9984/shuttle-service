require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // Assuming this function exists
const authRoutes = require('./routes/auth');
const routeRoutes = require('./routes/routes'); 
const busStopRoutes = require('./routes/busstop'); // New Import

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

const PORT = process.env.PORT || 5000;

app.use('/api/auth', authRoutes);
app.use('/api/routes', routeRoutes); 
app.use('/api/busstops', busStopRoutes); // New bus stop route setup

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});