// server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admins');
const driverRoutes = require('./routes/drivers');
const routeRoutes = require('./routes/routes');
const busStopRoutes = require('./routes/busStops');
const busRoutes = require('./routes/buses');
const scheduleRoutes = require('./routes/schedules');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');
const notificationRoutes = require('./routes/notifications');
const trackingRoutes = require('./routes/tracking');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: { origin: '*' }
});


connectDB(process.env.MONGODB_URI);

// basic middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/bus-stops', busStopRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/tracking', trackingRoutes);

// socket.io for real-time location updates
const Bus = require('./models/Bus');
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  // client may join rooms like schedule:<scheduleId> or route:<routeId>
  socket.on('joinRoom', ({ room }) => {
    socket.join(room);
  });

  socket.on('leaveRoom', ({ room }) => {
    socket.leave(room);
  });

  // driver devices can emit 'updateLocation' with busId and lat/lng
  socket.on('updateLocation', async ({ busId, latitude, longitude }) => {
    if (!busId) return;
    try {
      const bus = await Bus.findByIdAndUpdate(busId, {
        currentLatitude: latitude,
        currentLongitude: longitude,
        lastUpdated: new Date()
      }, { new: true });

      // broadcast to interested parties: room by busId and maybe route rooms
      socket.to(`bus:${busId}`).emit('busLocation', bus);
      io.to(`bus:${busId}`).emit('busLocation', bus);
      // Optionally also emit to route rooms if you associate buses->schedules->routes
      // (left as extension)
    } catch (err) {
      console.error('Error updating bus location', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

// periodic broadcaster: ensure frequent updates if needed (not required if devices push)
const BROADCAST_INTERVAL = 5000; // 5s
setInterval(async () => {
  try {
    const buses = await Bus.find({ currentLatitude: { $ne: null } });
    buses.forEach(bus => {
      io.to(`bus:${bus._id}`).emit('busLocation', bus);
    });
  } catch (err) {
    console.error('Error broadcasting bus locations', err);
  }
}, BROADCAST_INTERVAL);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
