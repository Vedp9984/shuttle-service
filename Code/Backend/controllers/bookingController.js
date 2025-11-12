// --- START OF FILE controllers/bookingController.js ---

const Booking = require('../models/booking');
const Journey = require('../models/journey');
const BusStop = require('../models/busstop'); 

// Helper function (Simulated Payment)
const processPayment = async (amount, paymentDetails) => {
    // NOTE: In a real app, integrate Stripe/other payment gateway here.
    console.log(`Simulating payment for $${amount}...`);
    // Simulate a successful payment and return a Transaction ID
    return { 
        success: true, 
        transactionId: `txn_${Date.now()}`,
        paymentMethod: paymentDetails.method || 'Card' // Infer method from dummy details
    }; 
};

// 1. Create a Booking (Multi-Seat Reservation and Payment Simulation)
exports.createBooking = async (req, res) => {
    try {
        // --- FIX: Destructure ALL fields needed for validation/logic ---
        const { journeyId, selectedSeats, pricePerSeat, userId, paymentDetails } = req.body; 
        
        if (!journeyId || !selectedSeats || selectedSeats.length === 0 || !userId) {
            return res.status(400).json({ message: 'Journey ID, selectedSeats, and userId are required.' });
        }

        const journey = await Journey.findById(journeyId);
        if (!journey) {
            return res.status(404).json({ message: 'Journey not found.' });
        }
        
        if (journey.totalSeats - journey.bookedSeats < selectedSeats.length) {
            return res.status(400).json({ message: 'Not enough seats available.' });
        }
        
        const seatPrice = pricePerSeat || 120;
        const totalAmount = selectedSeats.length * seatPrice;

        const paymentResult = await processPayment(totalAmount, paymentDetails);

        if (paymentResult.success) {
            // Your schema does not support an array of seats, only a single 'seatNumber' string.
            // Compromise: Store the list of seat numbers as a comma-separated string.
            const seatNumberString = selectedSeats.join(', ');
            
            // --- CRITICAL FIX: Mapping fields to YOUR Schema: userId, journeyId, amount, transactionId ---
            const newBooking = new Booking({
                userId: userId, 
                // CRITICAL NOTE: Your schema uses 'ref: Schedule' for journeyId. 
                // Assuming Journey is the operational Schedule model.
                journeyId: journeyId, 
                amount: totalAmount, 
                bookingDate: new Date(), 
                seatNumber: seatNumberString, 
                paymentMethod: paymentResult.paymentMethod,
                transactionId: paymentResult.transactionId,
                status: 'Confirmed',
            });
            await newBooking.save();

            journey.bookedSeats += selectedSeats.length;
            await journey.save();
            
            return res.status(201).json({ 
                message: 'Booking successful and confirmed.', 
                booking: newBooking 
            });
        } else {
            return res.status(400).json({ message: 'Payment failed. Booking cancelled.' });
        }
    } catch (err) {
        console.error('Error creating booking:', err);
        // Ensure a 400 response for Mongoose validation errors
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ message: 'Validation failed.', details: messages.join('; ') });
        }
        res.status(500).json({ message: 'Server error during booking.', error: err.message });
    }
};

// 2. Get User's Bookings (Past, Current, Upcoming, All)
exports.getUserBookings = async (req, res) => {
    try {
        const userId = req.query.userId; 
        const { type } = req.query; // 'past', 'current', 'upcoming', 'all'

        if (!userId) {
             return res.status(400).json({ message: 'userId is required in the query parameters.' });
        }

        const now = new Date();
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date(now);
        endOfToday.setHours(23, 59, 59, 999);
        
        // Step 1: Find all Confirmed Bookings for the user with full population
        const bookings = await Booking.find({ userId: userId, status: 'Confirmed' })
            .select('journeyId amount status bookingDate seatNumber')
            .populate({
                // CRITICAL FIX: Use journeyId as per YOUR schema
                path: 'journeyId', 
                select: 'route date',
                populate: {
                    path: 'route',
                    select: 'routeName originStop destinationStop',
                    populate: [
                        { path: 'originStop', model: 'BusStop', select: 'stopName' },
                        { path: 'destinationStop', model: 'BusStop', select: 'stopName' }
                    ]
                }
            })
            .sort({ bookingDate: -1 });

        // Step 2: Filter the results based on the Journey's date
        const finalBookings = bookings.filter(booking => {
            // CRITICAL FIX: Use journeyId for access
            if (!booking.journeyId || !booking.journeyId.date) {
                return false; 
            }

            const journeyDate = new Date(booking.journeyId.date);

            if (type === 'past') {
                return journeyDate < startOfToday;
            } else if (type === 'upcoming') {
                return journeyDate > endOfToday;
            } else if (type === 'current') {
                return journeyDate >= startOfToday && journeyDate <= endOfToday;
            } 
            return true;
        })
        // Rename internal field to 'journey'   for frontend compatibility
        .map(booking => ({
            _id: booking._id,
            seats: { length: booking.seatNumber ? booking.seatNumber.split(',').length : 1 }, // Derive seat count for frontend
            totalAmount: booking.amount,
            status: booking.status,
            bookingDate: booking.bookingDate,
            journey: booking.journeyId // Rename to 'journey' for UserBookingsList component
        }));


        // Step 3: Final sort by journey departure date/time
        finalBookings.sort((a, b) => new Date(a.journey.date) - new Date(b.journey.date));

        res.json(finalBookings);
    } catch (err) {
        console.error('Error fetching user bookings:', err);
        res.status(500).json({ message: 'Server error fetching bookings.', error: err.message });
    }
};