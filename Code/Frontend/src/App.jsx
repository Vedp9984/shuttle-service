import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import SeatSelectionadditonal from "./pages/SeatSelectionadditonal.jsx";
import GuestDetails from "./pages/GuestDetails.jsx";
import Addroute from "./pages/Addroute.jsx";
import Updatestatus1 from "./pages/Updatestatus1.jsx";
import Updatestatus2 from "./pages/Updatestatus2.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import DriverPage from "./pages/DriverPage.jsx";
import Payment from "./pages/Payment.jsx";
import BookingPage from "./pages/BookingPage.jsx";
import HomePageUser from "./pages/HomePageUser.jsx";
import CreateAccountUser from "./pages/CreateAccountUser.jsx";
import CreateAccountDriver from "./pages/CreateAccountDriver.jsx";
import Login from "./pages/Login.jsx";
import WelcomeScreen from "./pages/WelcomeScreen.jsx";
import AvatarBlock from "./pages/AvatarBlock.jsx";
import Group3 from "./pages/Group3.jsx";
import Group4 from "./pages/Group4.jsx";
import Viewroute from "./pages/Viewroute.jsx";
import Group22 from "./pages/Group22.jsx";
import Driverinfo from "./pages/Driverinfo.jsx";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PaymentSuccess />} />
        <Route
          path="/SeatSelectionadditonal"
          element={<SeatSelectionadditonal />}
        />
        <Route path="/GuestDetails" element={<GuestDetails />} />
        <Route path="/Addroute" element={<Addroute />} />
        <Route path="/Updatestatus1" element={<Updatestatus1 />} />
        <Route path="/Updatestatus2" element={<Updatestatus2 />} />
        <Route path="/AdminPage" element={<AdminPage />} />
        <Route path="/DriverPage" element={<DriverPage />} />
        <Route path="/Payment" element={<Payment />} />
        <Route path="/BookingPage" element={<BookingPage />} />
        <Route path="/HomePageUser" element={<HomePageUser />} />
        <Route path="/CreateAccountUser" element={<CreateAccountUser />} />
        <Route path="/CreateAccountDriver" element={<CreateAccountDriver />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/WelcomeScreen" element={<WelcomeScreen />} />
        <Route path="/AvatarBlock" element={<AvatarBlock />} />
        <Route path="/Group3" element={<Group3 />} />
        <Route path="/Group4" element={<Group4 />} />
        <Route path="/Viewroute" element={<Viewroute />} />
        <Route path="/Group22" element={<Group22 />} />
        <Route path="/Driverinfo" element={<Driverinfo />} />
      </Routes>
    </Router>
  );
};

export default App;
