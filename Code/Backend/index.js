require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); 
const authRoutes = require('./routes/auth');
const routeRoutes = require('./routes/routes'); 
const busStopRoutes = require('./routes/busstop'); 
const journeyRoutes = require('./routes/journeys'); // NEW
const vehicleRoutes = require('./routes/vehicles'); // NEW
const userRoutes = require('./routes/user');  // NEW


const app = express();
app.use(cors());
app.use(express.json());

connectDB();

const PORT = process.env.PORT || 5000;

app.use('/api/auth', authRoutes);
app.use('/api/routes', routeRoutes); 
app.use('/api/busstops', busStopRoutes);
app.use('/api/journeys', journeyRoutes);   // NEW
app.use('/api/vehicles', vehicleRoutes);   // NEW
app.use('/api/user', userRoutes);


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
