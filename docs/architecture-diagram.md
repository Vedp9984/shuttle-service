# 🏗️ Architecture Diagrams

## System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Browser]
        MOBILE[Mobile Browser]
    end
    
    subgraph "Frontend - React.js"
        UI[User Interface]
        ROUTER[React Router]
        STATE[State Management]
        COMP[Components]
    end
    
    subgraph "Backend - Node.js/Express"
        API[REST API]
        AUTH[Authentication JWT]
        MIDDLEWARE[Middleware]
        CONTROLLERS[Controllers]
    end
    
    subgraph "Data Layer"
        MONGO[(MongoDB)]
        MODELS[Mongoose Models]
    end
    
    WEB --> UI
    MOBILE --> UI
    UI --> ROUTER
    ROUTER --> COMP
    COMP --> STATE
    STATE --> API
    API --> AUTH
    AUTH --> MIDDLEWARE
    MIDDLEWARE --> CONTROLLERS
    CONTROLLERS --> MODELS
    MODELS --> MONGO
```

## High-Level System Architecture

```mermaid
graph LR
    subgraph "Users"
        PASS[Passenger]
        DRIVER[Driver]
        ADMIN[Administrator]
    end
    
    subgraph "Application"
        FE[Frontend React App]
        BE[Backend Express API]
    end
    
    subgraph "Data"
        DB[(MongoDB Database)]
    end
    
    PASS --> FE
    DRIVER --> FE
    ADMIN --> FE
    FE <-->|HTTP/REST| BE
    BE <-->|CRUD| DB
```

## Database Schema Architecture

```mermaid
erDiagram
    User ||--o{ Booking : creates
    User ||--o{ Journey : drives
    Route ||--o{ Journey : has
    Journey ||--o{ Booking : contains
    BusStop ||--o{ Route : includes
    Vehicle ||--o{ Journey : assigned
    
    User {
        string _id PK
        string name
        string email UK
        string password
        string phone
        enum role
        date createdAt
    }
    
    BusStop {
        string _id PK
        string name
        string code UK
        string address
        object coordinates
        boolean isActive
    }
    
    Route {
        string _id PK
        string name
        string routeCode UK
        ObjectId originStopId FK
        ObjectId destinationStopId FK
        array stops
        number totalDistance
        boolean isActive
    }
    
    Vehicle {
        string _id PK
        string registrationNumber UK
        string model
        number capacity
        string status
    }
    
    Journey {
        string _id PK
        ObjectId routeId FK
        ObjectId driverId FK
        ObjectId vehicleId FK
        date departureTime
        date arrivalTime
        string status
        number availableSeats
        number farePerKm
    }
    
    Booking {
        string _id PK
        ObjectId userId FK
        ObjectId journeyId FK
        ObjectId originStopId FK
        ObjectId destinationStopId FK
        number numberOfSeats
        number totalFare
        string status
        date bookingDate
    }
```

## API Architecture

```mermaid
graph TB
    subgraph "API Endpoints"
        AUTH_EP[/api/auth]
        USER_EP[/api/users]
        ROUTE_EP[/api/routes]
        STOP_EP[/api/bus-stops]
        JOURNEY_EP[/api/journeys]
        BOOKING_EP[/api/bookings]
        VEHICLE_EP[/api/vehicles]
    end
    
    subgraph "Middleware"
        AUTH_MW[Authentication]
        ROLE_MW[Authorization]
        VALID_MW[Validation]
        ERROR_MW[Error Handler]
    end
    
    subgraph "Controllers"
        AUTH_CTRL[AuthController]
        USER_CTRL[UserController]
        ROUTE_CTRL[RouteController]
        STOP_CTRL[BusStopController]
        JOURNEY_CTRL[JourneyController]
        BOOKING_CTRL[BookingController]
        VEHICLE_CTRL[VehicleController]
    end
    
    AUTH_EP --> AUTH_MW
    USER_EP --> AUTH_MW
    ROUTE_EP --> AUTH_MW
    STOP_EP --> AUTH_MW
    JOURNEY_EP --> AUTH_MW
    BOOKING_EP --> AUTH_MW
    VEHICLE_EP --> AUTH_MW
    
    AUTH_MW --> ROLE_MW
    ROLE_MW --> VALID_MW
    VALID_MW --> AUTH_CTRL
    VALID_MW --> USER_CTRL
    VALID_MW --> ROUTE_CTRL
    VALID_MW --> STOP_CTRL
    VALID_MW --> JOURNEY_CTRL
    VALID_MW --> BOOKING_CTRL
    VALID_MW --> VEHICLE_CTRL
    
    AUTH_CTRL --> ERROR_MW
    USER_CTRL --> ERROR_MW
    ROUTE_CTRL --> ERROR_MW
    STOP_CTRL --> ERROR_MW
    JOURNEY_CTRL --> ERROR_MW
    BOOKING_CTRL --> ERROR_MW
    VEHICLE_CTRL --> ERROR_MW
```

## Component Architecture

```mermaid
graph TB
    subgraph "Passenger Components"
        P_DASH[Dashboard]
        P_SEARCH[Search Journey]
        P_BOOKING[Booking Form]
        P_HISTORY[Booking History]
    end
    
    subgraph "Driver Components"
        D_DASH[Dashboard]
        D_JOURNEY[Journey List]
        D_UPDATE[Update Status]
        D_DETAILS[Journey Details]
    end
    
    subgraph "Admin Components"
        A_DASH[Dashboard]
        A_ROUTE[Route Management]
        A_JOURNEY[Journey Management]
        A_STOP[Stop Management]
        A_VEHICLE[Vehicle Management]
        A_DRIVER[Driver Management]
    end
    
    subgraph "Shared Components"
        NAVBAR[Navigation Bar]
        FOOTER[Footer]
        MODAL[Modal]
        FORM[Form Components]
        CARD[Card Components]
    end
    
    P_DASH --> NAVBAR
    D_DASH --> NAVBAR
    A_DASH --> NAVBAR
    P_SEARCH --> FORM
    P_BOOKING --> FORM
    D_UPDATE --> FORM
    A_ROUTE --> FORM
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant JWT
    participant Database
    
    User->>Frontend: Enter credentials
    Frontend->>API: POST /api/auth/login
    API->>Database: Verify credentials
    Database-->>API: User found
    API->>JWT: Generate token
    JWT-->>API: JWT token
    API-->>Frontend: Return token + user data
    Frontend->>Frontend: Store token in localStorage
    Frontend-->>User: Redirect to dashboard
    
    Note over User,Database: Subsequent Requests
    
    User->>Frontend: Access protected route
    Frontend->>API: Request + JWT token
    API->>JWT: Verify token
    JWT-->>API: Valid token
    API->>Database: Fetch data
    Database-->>API: Return data
    API-->>Frontend: Return response
    Frontend-->>User: Display data
```

## Booking Flow

```mermaid
sequenceDiagram
    participant Passenger
    participant Frontend
    participant API
    participant Database
    
    Passenger->>Frontend: Search journey
    Frontend->>API: GET /api/journeys/search
    API->>Database: Query available journeys
    Database-->>API: Return results
    API-->>Frontend: Journey list
    Frontend-->>Passenger: Display journeys
    
    Passenger->>Frontend: Select journey & seats
    Frontend->>API: POST /api/bookings
    API->>Database: Check availability
    Database-->>API: Seats available
    API->>Database: Create booking
    API->>Database: Update journey seats
    Database-->>API: Booking confirmed
    API-->>Frontend: Booking details
    Frontend-->>Passenger: Show confirmation
```

## Journey Status Update Flow

```mermaid
sequenceDiagram
    participant Driver
    participant Frontend
    participant API
    participant Database
    participant Passengers
    
    Driver->>Frontend: Update journey status
    Frontend->>API: PATCH /api/journeys/:id/status
    API->>Database: Update journey
    Database-->>API: Updated journey
    API-->>Frontend: Success response
    Frontend-->>Driver: Status updated
    
    API->>Database: Get affected bookings
    Database-->>API: Booking list
    API->>Passengers: Notify status change
    Passengers-->>Passengers: Receive notification
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Production Environment"
        LB[Load Balancer]
        
        subgraph "Application Servers"
            APP1[Node.js Instance 1]
            APP2[Node.js Instance 2]
        end
        
        subgraph "Static Assets"
            CDN[CDN/Static Server]
        end
        
        subgraph "Database"
            PRIMARY[(MongoDB Primary)]
            REPLICA[(MongoDB Replica)]
        end
        
        subgraph "Monitoring"
            LOGS[Log Management]
            METRICS[Metrics]
        end
    end
    
    CLIENT[Clients] --> LB
    LB --> APP1
    LB --> APP2
    CLIENT --> CDN
    APP1 --> PRIMARY
    APP2 --> PRIMARY
    PRIMARY --> REPLICA
    APP1 --> LOGS
    APP2 --> LOGS
    APP1 --> METRICS
    APP2 --> METRICS
```

## Technology Stack Overview

```mermaid
graph LR
    subgraph "Frontend Stack"
        REACT[React.js + Vite]
        TAILWIND[Tailwind CSS]
        RR[React Router]
        ICONS[React Icons]
    end
    
    subgraph "Backend Stack"
        NODE[Node.js]
        EXPRESS[Express.js]
        JWT_LIB[jsonwebtoken]
        BCRYPT[bcrypt]
    end
    
    subgraph "Database Stack"
        MONGODB[(MongoDB)]
        MONGOOSE[Mongoose ODM]
    end
    
    REACT --> NODE
    TAILWIND --> REACT
    RR --> REACT
    ICONS --> REACT
    EXPRESS --> NODE
    JWT_LIB --> EXPRESS
    BCRYPT --> EXPRESS
    MONGOOSE --> MONGODB
    EXPRESS --> MONGOOSE
```

---

**Note**: These diagrams use Mermaid syntax and will render properly on GitHub, GitLab, and any Markdown viewer that supports Mermaid diagrams.
