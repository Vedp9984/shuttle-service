# 🚌 Shuttle Service Management System

## 📋 Project Overview

A comprehensive web-based shuttle service management system that enables efficient bus route management, journey scheduling, real-time tracking, and seamless booking experiences for passengers, drivers, and administrators.

---

## 🎯 Project Objectives

- **Streamline Operations**: Automate shuttle service management from route planning to booking
- **Real-time Tracking**: Enable live journey tracking and status updates
- **User-Friendly Booking**: Provide intuitive interface for passengers to search and book journeys
- **Driver Management**: Empower drivers with mobile-friendly dashboard for journey updates
- **Admin Control**: Centralized dashboard for managing routes, vehicles, and journeys

---

## 📚 Project Documentation

### 🔗 Important Links

- **UI Design (Figma)**: [View Design](https://www.figma.com/design/uMAzYIsVK5PKBEEjMlkF81/Sure-Bus?node-id=0-1&t=PDhSqLKS06oWxp45-1)
- **Class Diagram (Mermaid)**: [View Diagram](https://mermaid.live/edit#pako:eNqtV01v2zgQ_SsCT7vbNIjiOLF1S-tDC2SDIE4vhYFgLI5lIhIpkFS63iD_vUNJNvQxCrrA-pBI73HImTdDDvUqUiNRJCLNwbmVgsxCsdER_aSymHpldHT3uNENVo-Kvju00WuDhN-HtbdKZ1FF-FfJ4xoKHDNYgMrHcEmr_DRWfgG3H7M7ZZ2_Z-cj9yaYcm803lfFFm2HtJgp59H-8WcHzE2mdA9BqfyDNTuVYw9_Ufjz0VQeXQ8u4Bk_GfNM6_bwFHSKOccURqrdgWO8hfT5U3Va4K2filtZKM3lAgLx35IxofpYDpCyjnqk0Ri1WJgXHOO0lMr0yqoXtN_MOt2jrBhxQ6W5EdrqNBRdQ4YPcChQ-wFltPLGkop3JoVQ0n3eoZb3xqudatjRgrca8oNX6VQWmji4NMia-V_y0LK8Ta5S1G5c4OPk1fHU6qNkda9KCR6_WVWuPfjKDfJZGuu_6lRJknlCjjrdnBo2EJwYNcFvXIkuJV9CXsaksYriY4280jAwWplqm2O0BYcPlgTrl_Tam5Kp3S48iJMKKrBcpI5wLtCAD-JsvcrJW19JjjE661ADJ445ZL1ouUnJOWJbOQ5mKnkV6kQVSHKXYH1l6zduAFiyhpyho1BsnE6h9Dq40j6CF-oWQJKsEfyQ9MZDPiSaWmbquCFuexNOZ5nTdkImgkebMLiXQgmp8oexBZ39mI-znlbW0ha7myyL44B-dfR1D_3wex2q5GNrTlI2voaaOrrY4ubKrU5yO9mKzzWJP9Jsqg7a4KEwlfYdvLQmRefa87_fa8oyP3yue29eHwmP5ONUttsJOEXKhmKzzog15ekpOe18vCgF-r2RvyFIG_hEON22xsWkOzx7SmCqSjURtT-UrOfOUSfmIvb0hwIoyg5JJZgj6Ei5RwQ56MqjqOqr50bEGxF9_EgPf9HDsYiTOg1uemBPjCTEhnSmuePczV3qfZvg1Mmg6XNDb9qmkERKpzntS_fO4NPhnUR7OM17Qjuj42ZqGki7z70_rr2OJBG0ff7Jm2mLvoSp0R6UPvkS1nxfEsp6ltE17ak5U93TztiTdTvvwMHjJkuitnrJxe1BnInMKikSbys8EwVa-jqgV1HX7Ub4PVL7EAk9SrDPG7HRb2RTgv5hTHE0o76W7UWyg9zRW-NT-11zQunclGg_h40pktnNxVU9i0hexT_0fh2fL-bxYrmIl7PZfEnkQSSL5Xl8Nb-MbxbL-fziZhG_nYl_62UvzufXi8s4XsyuZ8vrq6vLMxHuwsb-3X5ZhX9vvwBsBQXa)
- **SRS Document**: [View SRS](https://docs.google.com/document/d/1nRO161rsqRnFuwiDjEQ9D5Z7YbjKGuy7qTdGuhCHyEE/edit?usp=sharing)
- **Project Tracker**: [View Tracker](https://docs.google.com/spreadsheets/d/1WMpb5YL0sYfu5PAN8fRTqTatcmwAD1vz6-yxJ0LBftY/edit?usp=sharing)
- **Architecture Diagrams**: [View Diagrams](./docs/architecture-diagram.md)

### 📁 Documentation Structure

---

## 🏗️ System Architecture

### Technology Stack

#### Frontend
- **Framework**: React.js (Vite)
- **Styling**: CSS-in-JS with Tailwind CSS
- **Icons**: React Icons (Font Awesome)
- **Routing**: React Router DOM
- **State Management**: React Hooks (useState, useEffect)

#### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcrypt for password hashing

#### Architecture Pattern
- **RESTful API** design
- **MVC (Model-View-Controller)** pattern
- **Component-based** frontend architecture

### System Architecture Diagram

---

## 👥 User Roles & Features

### 1. 🧑‍💼 Passenger Features

#### Journey Booking
- **Search Functionality**
  - Search by origin stop, destination stop, and date
  - Real-time availability checking
  - Direct and indirect route support

- **Booking Management**
  - Select multiple seats
  - Secure payment processing
  - View booking history (Upcoming, Current, Past)
  - Booking confirmation with details

- **Journey Details**
  - Complete route information with all stops
  - Departure and arrival times
  - Vehicle and driver information
  - Real-time seat availability
  - Dynamic pricing based on duration

#### User Dashboard
- Welcome screen with personalized greeting
- Quick access to search and book journeys
- View upcoming journeys at a glance
- Easy navigation and responsive design

### 2. 🚗 Driver Features

#### Journey Management
- **Dashboard Overview**
  - Current day journeys
  - Upcoming scheduled trips
  - Past journey history

- **Real-time Updates**
  - Update journey status (Scheduled → Ongoing → Completed)
  - Update current stop location
  - Report delays with estimated minutes
  - View route details and stops

- **Journey Information**
  - Route name and code
  - Origin and destination
  - Assigned vehicle details
  - Departure and arrival times
  - Passenger count and bookings

### 3. 👨‍💼 Administrator Features

#### Route Management
- Create, edit, and delete routes
- Define origin and destination stops
- Add intermediate stops with timings
- Set route codes and descriptions
- Activate/deactivate routes

#### Journey Scheduling
- Create journeys for specific routes
- Assign drivers and vehicles
- Set departure dates and times
- Manage seat capacity
- Monitor booking status

#### Bus Stop Management
- Add new bus stops
- Update stop information
- Set coordinates for mapping
- Manage stop availability

#### Vehicle Management
- Register new vehicles
- Track vehicle maintenance
- Assign vehicles to journeys
- Monitor vehicle utilization

#### Driver Management
- Add driver profiles
- Assign drivers to journeys
- View driver schedules
- Track driver performance

---

## 🔑 Key Features

### 1. Intelligent Journey Search

#### UI Design Figma Link : 
- https://www.figma.com/design/uMAzYIsVK5PKBEEjMlkF81/Sure-Bus?node-id=0-1&t=PDhSqLKS06oWxp45-1
#### class Diagram link:
 https://mermaid.live/edit#pako:eNqtV01v2zgQ_SsCT7vbNIjiOLF1S-tDC2SDIG4vhYFgLI5lIhIpkFS63iD_vUNJNvQxCrrA-pBI73HImTdDDvUqUiNRJCLNwbmVgsxCsdER_aSymHpldHT3uNENVo-Kvju00WuDhN-HtbdKZ1FF-FfJ4xoKHDNYgMrHcEmr_DRWfgG3H7M7ZZ2_Z-cj9yaYcm803lfFFm2HtJgp59H-8WcHzE2mdA9BqfyDNTuVYw9_Ufjz0VQeXQ8u4Bk_GfNM6_bwFHSKOccURqrdgWO8hfT5U3Va4K2filtZKM3lAgLx35IxofpYDpCyjnqk0Ri1WJgXHOO0lMr0yqoXtN_MOt2jrBhxQ6W5EdrqNBRdQ4YPcChQ-wFltPLGkop3JoVQ0n3eoZb3xqudatjRgrca8oNX6VQWmji4NMia-V_y0LK8Ta5S1G5c4OPk1fHU6qNkda9KCR6_WVWuPfjKDfJZGuu_6lRJknlCjjrdnBo2EJwYNcFvXIkuJV9CXsaksYriY4280jAwWplqm2O0BYcPlgTrl_Tam5Kp3S48iJMKKrBcpI5wLtCAD-JsvcrJW19JjjE661ADJ445ZL1ouUnJOWJbOQ5mKnkV6kQVSHKXYH1l6zduAFiyhpyho1BsnE6h9Dq40j6CF-oWQJKsEfyQ9MZDPiSaWmbquCFuexNOZ5nTdkImgkebMLiXQgmp8oexBZ39mI-znlbW0ha7myyL44B-dfR1D_3wex2q5GNrTlI2voaaOrrY4ubKrU5yO9mKzzWJP9Jsqg7a4KEwlfYdvLQmRefa87_fa8oyP3yue29eHwmP5ONUttsJOEXKhmKzzog15ekpOe18vCgF-r2RvyFIG_hEON22xsWkOzx7SmCqSjURtT-UrOfOUSfmIvb0hwIoyg5JJZgj6Ei5RwQ56MqjqOqr50bEGxF9_EgPf9HDsYiTOg1uemBPjCTEhnSmuePczV3qfZvg1Mmg6XNDb9qmkERKpzntS_fO4NPhnUR7OM17Qjuj42ZqGki7z70_rr2OJBG0ff7Jm2mLvoSp0R6UPvkS1nxfEsp6ltE17ak5U93TztiTdTvvwMHjJkuitnrJxe1BnInMKikSbys8EwVa-jqgV1HX7Ub4PVL7EAk9SrDPG7HRb2RTgv5hTHE0o76W7UWyg9zRW-NT-11zQunclGg_h40pktnNxVU9i0hexT_0fh2fL-bxYrmIl7PZfEnkQSSL5Xl8Nb-MbxbL-fziZhG_nYl_62UvzufXi8s4XsyuZ8vrq6vLMxHuwsb-3X5ZhX9vvwBsBQXa

### SRS doc link:https://docs.google.com/document/d/1nRO161rsqRnFuwiDjEQ9D5Z7YbjKGuy7qTdGuhCHyEE/edit?usp=sharing
### Project tracker doc link:https://docs.google.com/spreadsheets/d/1WMpb5YL0sYfu5PAN8fRTqTatcmwAD1vz6-yxJ0LBftY/edit?usp=sharing
### Docs Folder:
- Contains SRS
- Class Diagram
- Sequence Diagrams

---

## ✅ Features Implemented

### 🔐 Authentication & Authorization

#### User Registration & Login
- ✅ Secure user registration with email validation
- ✅ Password hashing using bcrypt (10 salt rounds)
- ✅ JWT-based authentication with 24-hour token expiry
- ✅ Role-based access control (Passenger, Driver, Admin)
- ✅ Protected routes with middleware authentication
- ✅ Automatic token storage in localStorage
- ✅ Auto-redirect based on user role after login

#### Session Management
- ✅ Persistent login sessions across browser refreshes
- ✅ Automatic logout on token expiration
- ✅ Secure token validation on each API request

### 👤 User Management

#### Profile Management
- ✅ View user profile information
- ✅ Update profile details (name, phone, email)
- ✅ Role-based dashboard access
- ✅ User-specific navigation menus

### 🚏 Bus Stop Management (Admin)

#### CRUD Operations
- ✅ Create new bus stops with name, code, and address
- ✅ View all bus stops in a paginated list
- ✅ Edit existing bus stop information
- ✅ Delete bus stops (soft delete with isActive flag)
- ✅ Search and filter bus stops

#### Stop Features
- ✅ Unique stop codes for easy identification
- ✅ Geographic coordinates support (latitude/longitude)
- ✅ Active/Inactive status management
- ✅ Address and location details

### 🛣️ Route Management (Admin)

#### Route Creation & Management
- ✅ Create routes with origin and destination stops
- ✅ Add multiple intermediate stops with sequence
- ✅ Set estimated arrival times for each stop
- ✅ Calculate total route distance
- ✅ Unique route codes (e.g., RT-001)
- ✅ Route descriptions and details

#### Route Operations
- ✅ View all routes with complete stop information
- ✅ Edit route details and stop sequences
- ✅ Delete routes (with validation for active journeys)
- ✅ Activate/Deactivate routes
- ✅ View route-specific journey history

#### Route Display
- ✅ Visual route display with origin → destination
- ✅ Intermediate stops with timing information
- ✅ Route status indicators
- ✅ Total stops count and distance

### 🚐 Vehicle Management (Admin)

#### Vehicle Registry
- ✅ Add new vehicles with registration numbers
- ✅ Vehicle model and capacity information
- ✅ Vehicle status tracking (Available, In Use, Maintenance)
- ✅ Unique registration number validation
- ✅ View all vehicles with status indicators

#### Vehicle Operations
- ✅ Edit vehicle details
- ✅ Update vehicle status
- ✅ Delete vehicle records
- ✅ Assign vehicles to journeys
- ✅ Track vehicle utilization

### 🗓️ Journey Management (Admin)

#### Journey Scheduling
- ✅ Create journeys for specific routes
- ✅ Assign drivers to journeys
- ✅ Assign vehicles to journeys
- ✅ Set departure date and time
- ✅ Auto-calculate arrival time based on route
- ✅ Set fare per kilometer
- ✅ Define total available seats

#### Journey Operations
- ✅ View all journeys (upcoming, ongoing, completed)
- ✅ Filter journeys by status and date
- ✅ Edit journey details
- ✅ Cancel/Delete journeys
- ✅ Monitor seat availability in real-time
- ✅ View journey booking details

#### Journey Status Management
- ✅ Journey status tracking (Scheduled, Ongoing, Completed, Cancelled)
- ✅ Automatic status updates based on time
- ✅ Current stop tracking

### 🔍 Journey Search & Booking (Passenger)

#### Smart Search
- ✅ Search by origin stop, destination stop, and date
- ✅ Date picker for journey selection
- ✅ Real-time availability checking
- ✅ Display available journeys with details
- ✅ Show route information with all stops
- ✅ Display departure and arrival times
- ✅ Show available seats count
- ✅ Calculate and display fare based on distance

#### Search Results Display
- ✅ Journey cards with comprehensive information
- ✅ Route visualization with stops
- ✅ Vehicle and driver information
- ✅ Seat availability indicators
- ✅ Fare breakdown
- ✅ "Book Now" call-to-action buttons

### 🎫 Booking Management (Passenger)

#### Booking Creation
- ✅ Select number of seats (1-10)
- ✅ Choose origin and destination from route stops
- ✅ Auto-calculate fare based on distance
- ✅ Validate seat availability before booking
- ✅ Create booking with unique booking ID
- ✅ Instant booking confirmation

#### Booking Display
- ✅ View booking history categorized by status
  - **Upcoming**: Future journeys
  - **Current**: Ongoing journeys
  - **Past**: Completed journeys
- ✅ Booking details with journey information
- ✅ Route details with all stops
- ✅ Departure and arrival times
- ✅ Seat numbers and fare information
- ✅ Booking date and status

#### Booking Operations
- ✅ Cancel upcoming bookings
- ✅ View booking confirmation details
- ✅ Track booking status in real-time
- ✅ Filter bookings by date range

### 🚗 Driver Dashboard & Operations

#### Dashboard Overview
- ✅ View assigned journeys for current day
- ✅ Journey cards with route information
- ✅ Passenger count display
- ✅ Departure and arrival times
- ✅ Vehicle assignment details
- ✅ Current journey status

#### Journey Updates (Driver)
- ✅ Update journey status (Scheduled → Ongoing → Completed)
- ✅ Update current stop location
- ✅ Report delays with estimated minutes
- ✅ View passenger booking list
- ✅ Real-time seat occupancy

#### Driver Journey View
- ✅ Filter journeys by status (All, Scheduled, Ongoing, Completed)
- ✅ View journey details with route map
- ✅ Access passenger contact information
- ✅ Update journey progress in real-time

### 📊 Admin Dashboard

#### Overview Statistics
- ✅ Total routes count
- ✅ Total journeys count
- ✅ Total bookings count
- ✅ Active drivers count
- ✅ Available vehicles count
- ✅ Total bus stops count

#### Quick Access
- ✅ Navigation to all management modules
- ✅ Recent activity feed
- ✅ System status indicators
- ✅ Quick create buttons for entities

### 🎨 User Interface & Experience

#### Responsive Design
- ✅ Mobile-first responsive layout
- ✅ Tailwind CSS for consistent styling
- ✅ Adaptive navigation bar
- ✅ Mobile-friendly forms and tables
- ✅ Touch-optimized interactions

#### Navigation
- ✅ Role-based navigation menus
- ✅ Active route highlighting
- ✅ Breadcrumb navigation
- ✅ Quick access shortcuts
- ✅ Logout functionality

#### UI Components
- ✅ Loading states and spinners
- ✅ Success/Error toast notifications
- ✅ Confirmation dialogs for critical actions
- ✅ Empty states with helpful messages
- ✅ Form validation with error messages
- ✅ Date pickers and dropdowns
- ✅ Icon-based visual cues (React Icons)

#### Visual Feedback
- ✅ Status badges with colors
  - 🟢 Active/Available/Confirmed
  - 🟡 Scheduled/Pending
  - 🔵 Ongoing
  - ⚪ Completed
  - 🔴 Cancelled/Inactive
- ✅ Hover effects on interactive elements
- ✅ Disabled state for unavailable actions
- ✅ Progress indicators for multi-step processes

### 🔒 Security Features

#### Data Protection
- ✅ Password hashing with bcrypt
- ✅ JWT token-based authentication
- ✅ Protected API routes with middleware
- ✅ Role-based access control (RBAC)
- ✅ Input validation and sanitization
- ✅ SQL injection prevention (MongoDB)
- ✅ XSS protection

#### API Security
- ✅ Token verification on each request
- ✅ User authorization checks
- ✅ Error handling without sensitive data exposure
- ✅ CORS configuration
- ✅ Rate limiting (ready for implementation)

### 🗄️ Database & Backend

#### MongoDB Schema Design
- ✅ User model with role-based fields
- ✅ BusStop model with geolocation
- ✅ Route model with stop sequences
- ✅ Vehicle model with status tracking
- ✅ Journey model with relationships
- ✅ Booking model with fare calculation
- ✅ Proper indexing for performance
- ✅ Mongoose ODM for schema validation

#### API Endpoints Implemented
- ✅ **Auth**: `/api/auth/register`, `/api/auth/login`
- ✅ **Users**: `/api/users/profile`, `/api/users/:id`
- ✅ **Bus Stops**: Full CRUD operations
- ✅ **Routes**: Full CRUD with stop management
- ✅ **Vehicles**: Full CRUD with status updates
- ✅ **Journeys**: Full CRUD with search and filtering
- ✅ **Bookings**: Create, view, cancel operations

#### Backend Features
- ✅ RESTful API design
- ✅ Express.js middleware chain
- ✅ Error handling middleware
- ✅ Request validation
- ✅ Async/await error handling
- ✅ Mongoose model relationships
- ✅ Query optimization with populate

### 📱 Frontend State Management

#### React Hooks
- ✅ useState for local component state
- ✅ useEffect for API calls and side effects
- ✅ useNavigate for programmatic routing
- ✅ Custom hooks for auth context
- ✅ Form state management

#### Data Flow
- ✅ Props drilling for component communication
- ✅ Context API for authentication state
- ✅ LocalStorage for token persistence
- ✅ API service layer for backend communication

### 🚀 Performance Optimizations

- ✅ Lazy loading of routes
- ✅ Efficient re-renders with React keys
- ✅ Debouncing for search inputs
- ✅ Pagination for large data sets
- ✅ Optimized MongoDB queries with indexing
- ✅ Mongoose lean queries where applicable

### 🧪 Testing Ready Features

- ✅ Modular component structure
- ✅ Separated business logic
- ✅ API service layer
- ✅ Environment-based configuration
- ✅ Error boundary ready structure

---

## 🚧 Future Enhancements

### Planned Features
- 📧 Email notifications for bookings
- 📱 SMS alerts for journey updates
- 🗺️ Interactive route maps with Google Maps
- 💳 Payment gateway integration
- 📊 Advanced analytics dashboard
- ⭐ Rating and review system
- 🔔 Real-time push notifications
- 📱 Progressive Web App (PWA)
- 🌐 Multi-language support
- 📈 Revenue reports and insights

### Technical Improvements
- Unit and integration testing (Jest, React Testing Library)
- End-to-end testing (Cypress)
- API documentation (Swagger/OpenAPI)
- Code coverage reports
- CI/CD pipeline
- Docker containerization
- WebSocket for real-time updates
- Redis caching layer
- Load balancing setup

---

## 📈 Project Statistics

- **Total Components**: 50+ React components
- **API Endpoints**: 30+ RESTful endpoints
- **Database Models**: 6 Mongoose schemas
- **User Roles**: 3 (Passenger, Driver, Admin)
- **Lines of Code**: ~15,000+ lines
- **Development Time**: 4-6 weeks
