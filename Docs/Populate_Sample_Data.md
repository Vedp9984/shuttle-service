### **Part 1: Create Database and Populate Data (for `mongosh`)**

Copy and paste this entire block into your **`mongosh` shell**.

```javascript
// Switch to or create the new database
use('shuttle_service_db');

// --- Drop existing collections to start fresh ---
db.users.drop();
db.admins.drop();
db.drivers.drop();
db.routes.drop();
db.bus_stops.drop();
db.buses.drop();
db.schedules.drop();
db.bookings.drop();
db.payments.drop();
db.notifications.drop();

// --- Generate ObjectIDs for linking documents ---
const userIdPriya = new ObjectId();
const adminIdAmit = new ObjectId();
const driverIdRaj = new ObjectId();
const routeIdCorp = new ObjectId();
const routeIdCampus = new ObjectId();
const busStopIdHq = new ObjectId();
const busStopIdDowntown = new ObjectId();
const busStopIdTechPark = new ObjectId();
const busIdA = new ObjectId();
const busIdB = new ObjectId();
const scheduleId1 = new ObjectId();
const scheduleId2 = new ObjectId();
const bookingId1 = new ObjectId();
const paymentId1 = new ObjectId();

// --- 1. Populate Users Collection (Riders) ---
db.users.insertMany([
  {
    "_id": userIdPriya,
    "username": "priya_s",
    "email": "priya.s@examplecorp.com",
    "passwordHash": "hashed_password_123", // In a real app, this would be properly hashed
    "firstName": "Priya",
    "lastName": "Sharma",
    "phoneNumber": "555-0101"
  },
  {
    "username": "test_user",
    "email": "test@example.com",
    "passwordHash": "hashed_password_456",
    "firstName": "Test",
    "lastName": "User",
    "phoneNumber": "555-0102"
  }
]);

// --- 2. Populate Admins Collection ---
db.admins.insertOne({
  "_id": adminIdAmit,
  "username": "amit_ops",
  "passwordHash": "admin_hashed_password_789",
  "firstName": "Amit",
  "lastName": "Patel"
});

// --- 3. Populate Drivers Collection ---
db.drivers.insertOne({
  "_id": driverIdRaj,
  "username": "raj_d",
  "passwordHash": "driver_hashed_password_abc",
  "name": "Raj Kumar",
  "licenseNumber": "DL12345XYZ"
});

// --- 4. Populate Bus Stops Collection ---
db.bus_stops.insertMany([
    { "_id": busStopIdHq, "stopName": "Corporate HQ", "latitude": 12.9716, "longitude": 77.5946 },
    { "_id": busStopIdDowntown, "stopName": "Downtown Transit Center", "latitude": 12.9750, "longitude": 77.6000 },
    { "_id": busStopIdTechPark, "stopName": "Global Tech Park", "latitude": 12.9515, "longitude": 77.6321 }
]);

// --- 5. Populate Routes Collection ---
db.routes.insertMany([
  {
    "_id": routeIdCorp,
    "routeName": "Morning Commute - HQ",
    "description": "Connects Downtown to Corporate HQ and Global Tech Park.",
    "origin": "Downtown Transit Center",
    "destination": "Corporate HQ",
    "basePrice": 5.00,
    "stops": [busStopIdDowntown, busStopIdTechPark, busStopIdHq] // Array of BusStop ObjectIDs
  },
  {
    "_id": routeIdCampus,
    "routeName": "Evening Return",
    "description": "Return trip from Corporate HQ.",
    "origin": "Corporate HQ",
    "destination": "Downtown Transit Center",
    "basePrice": 5.00,
    "stops": [busStopIdHq, busStopIdTechPark, busStopIdDowntown]
  }
]);

// --- 6. Populate Buses Collection ---
db.buses.insertMany([
  {
    "_id": busIdA,
    "busNumber": "SH-001",
    "capacity": 40,
    "model": "Volvo 9400",
    "currentLatitude": 12.9716,
    "currentLongitude": 77.5946,
    "lastUpdated": new ISODate()
  },
  {
    "_id": busIdB,
    "busNumber": "SH-002",
    "capacity": 35,
    "model": "Tata Marcopolo",
    "currentLatitude": null,
    "currentLongitude": null,
    "lastUpdated": null
  }
]);

// --- 7. Populate Schedules Collection ---
// Using tomorrow's date for relevance
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowDateOnly = new Date(tomorrow.setUTCHours(0, 0, 0, 0));

db.schedules.insertMany([
  {
    "_id": scheduleId1,
    "routeId": routeIdCorp,
    "busId": busIdA,
    "driverId": driverIdRaj,
    "departureTime": new ISODate(new Date(tomorrow).setUTCHours(8, 30, 0, 0)), // Tomorrow at 8:30 AM UTC
    "arrivalTime": new ISODate(new Date(tomorrow).setUTCHours(9, 30, 0, 0)), // Tomorrow at 9:30 AM UTC
    "date": tomorrowDateOnly,
    "status": "Scheduled", // e.g., Scheduled, In Transit, Completed, Cancelled
    "totalSeats": 40,
    "availableSeats": 39
  },
  {
    "_id": scheduleId2,
    "routeId": routeIdCampus,
    "busId": busIdB,
    "driverId": driverIdRaj,
    "departureTime": new ISODate(new Date(tomorrow).setUTCHours(17, 30, 0, 0)), // Tomorrow at 5:30 PM UTC
    "arrivalTime": new ISODate(new Date(tomorrow).setUTCHours(18, 30, 0, 0)), // Tomorrow at 6:30 PM UTC
    "date": tomorrowDateOnly,
    "status": "Scheduled",
    "totalSeats": 35,
    "availableSeats": 35
  }
]);

// --- 8. Populate Bookings Collection ---
db.bookings.insertOne({
  "_id": bookingId1,
  "userId": userIdPriya,
  "scheduleId": scheduleId1,
  "bookingDate": new ISODate(),
  "seatNumber": "12A",
  "status": "Confirmed", // e.g., Confirmed, Cancelled
  "amount": 5.00
});

// --- 9. Populate Payments Collection ---
db.payments.insertOne({
    "_id": paymentId1,
    "bookingId": bookingId1,
    "amount": 5.00,
    "paymentDate": new ISODate(),
    "method": "Credit Card", // e.g., Credit Card, PayPal
    "status": "Completed" // e.g., Pending, Completed, Failed
});

// --- 10. Populate Notifications Collection ---
db.notifications.insertOne({
    "recipientId": userIdPriya, // Can be a userId, driverId, or 'all'
    "type": "BookingConfirmation", // e.g., BookingConfirmation, Delay, Cancellation
    "message": "Your booking for the Morning Commute - HQ has been confirmed.",
    "timestamp": new ISODate(),
    "isRead": false
});

print("✅ Database 'shuttle_service_db' created and populated successfully.");
```

### **Part 2: Sample Queries for Various Scenarios**

Here are the commands to fetch data for different use cases. Run these one by one in your **`mongosh` shell** after populating the database.

**Scenario 1: A Rider (Priya) wants to view her upcoming bookings.**

```javascript
// First, find Priya's userId from the users collection.
const priya = db.users.findOne({ "username": "priya_s" });

// Then, use her _id to find all her bookings.
db.bookings.find({ "userId": priya._id });
```

**Scenario 2: A Rider wants to see all available schedules for a specific route for tomorrow.**

```javascript
// First, find the route's ID.
const morningRoute = db.routes.findOne({ "routeName": "Morning Commute - HQ" });

// Set date range for tomorrow
const startOfTomorrow = new Date();
startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
startOfTomorrow.setUTCHours(0, 0, 0, 0);

const endOfTomorrow = new Date(startOfTomorrow);
endOfTomorrow.setUTCHours(23, 59, 59, 999);

// Find schedules for that route within the date range with available seats.
db.schedules.find({
  "routeId": morningRoute._id,
  "departureTime": { "$gte": startOfTomorrow, "$lt": endOfTomorrow },
  "availableSeats": { "$gt": 0 }
});
```

**Scenario 3: An Admin (Amit) wants to see all passengers for a specific trip.**

```javascript
// Get the scheduleId for the trip.
const schedule = db.schedules.findOne({ "status": "Scheduled" }); // Just picking the first one for this example

// Find all bookings for this scheduleId and populate user information.
db.bookings.aggregate([
  {
    $match: { "scheduleId": schedule._id }
  },
  {
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "passengerInfo"
    }
  },
  {
    $unwind: "$passengerInfo"
  },
  {
    $project: {
        _id: 0,
        bookingId: "$_id",
        status: "$status",
        seatNumber: "$seatNumber",
        passengerName: { $concat: ["$passengerInfo.firstName", " ", "$passengerInfo.lastName"] },
        passengerEmail: "$passengerInfo.email"
    }
  }
]);
```

**Scenario 4: A Driver (Raj) wants to see his schedule for tomorrow.**

```javascript
// First, find Raj's driverId.
const raj = db.drivers.findOne({ "name": "Raj Kumar" });

// Use the same date range from Scenario 2
const startOfTomorrow_driver = new Date();
startOfTomorrow_driver.setDate(startOfTomorrow_driver.getDate() + 1);
startOfTomorrow_driver.setUTCHours(0, 0, 0, 0);

const endOfTomorrow_driver = new Date(startOfTomorrow_driver);
endOfTomorrow_driver.setUTCHours(23, 59, 59, 999);

// Find all schedules assigned to Raj for tomorrow and populate route and bus info.
db.schedules.aggregate([
    {
        $match: {
            "driverId": raj._id,
            "departureTime": { "$gte": startOfTomorrow_driver, "$lt": endOfTomorrow_driver }
        }
    },
    {
        $lookup: { from: "routes", localField: "routeId", foreignField: "_id", as: "routeInfo" }
    },
    {
        $lookup: { from: "buses", localField: "busId", foreignField: "_id", as: "busInfo" }
    },
    { $unwind: "$routeInfo" },
    { $unwind: "$busInfo" },
    {
        $project: {
            _id: 0,
            scheduleId: "$_id",
            routeName: "$routeInfo.routeName",
            busNumber: "$busInfo.busNumber",
            departure: "$departureTime",
            status: "$status"
        }
    }
]);
```

**Scenario 5: An Admin wants to see all active buses (live tracking).**

```javascript
// This query finds buses whose location was updated in the last 10 minutes.
const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

db.buses.find({
    "lastUpdated": { "$gte": tenMinutesAgo }
});
```