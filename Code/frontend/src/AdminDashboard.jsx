// AdminDashboard.jsx
import React from 'react';
import { FaHome, FaSignOutAlt, FaBell, FaPlus, FaPencilAlt, FaTrash, FaChartBar, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from './auth'; // Import auth utilities

// Import your modals
import AddRouteModal from './AddRouteModal';
import AddBusStopModal from './AddBusStopModal';
import EditRouteModal from './EditRouteModal';
import EditBusStopModal from './EditBusStopModal';
import RemoveRouteModal from './RemoveRouteModal';
import RemoveBusStopModal from './RemoveBusStopModal';
// import ViewStatisticsModal from './ViewStatisticsModal';
import SearchBusStopModal from './SearchBusStopModal';
import SearchRouteModal from './SearchRouteModal';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser(); // Get the logged-in user's data

  // ✅ State to control which modal is open
  const [openModal, setOpenModal] = React.useState('');

  // Logout handler
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navigate to admin home
  const handleHome = () => {
    navigate('/admin');
  };

  return (
    <div style={styles.dashboard}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logoContainer}>
            <span style={styles.logoText}>🚌</span>
          </div>
          <div style={styles.userInfo}>
            <h2 style={styles.userName}>Hello, {currentUser ? currentUser.email : 'Admin'}!</h2>
            <p style={styles.userRole}>You are the Admin!</p>
          </div>
        </div>
        <div style={styles.notificationIcon}>
          <FaBell />
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.mainContent}>
        <div className="buttonGrid">
          <button className="actionButton" onClick={() => setOpenModal('addRoute')}><FaPlus /> Add Route</button>
          <button className="actionButton" onClick={() => setOpenModal('addBusStop')}><FaPlus /> Add Bus Stop</button>
          <button className="actionButton" onClick={() => setOpenModal('editRoute')}><FaPencilAlt /> Edit Route</button>
          <button className="actionButton" onClick={() => setOpenModal('editBusStop')}><FaPencilAlt /> Edit Bus Stop</button>
          <button className="actionButton" onClick={() => setOpenModal('removeRoute')}><FaTrash /> Remove Route</button>
          <button className="actionButton" onClick={() => setOpenModal('removeBusStop')}><FaTrash /> Remove Bus Stop</button>
          {/* <button className="actionButton" onClick={() => setOpenModal('viewStats')}><FaChartBar /> View Statistics</button> */}
          <button className="actionButton" onClick={() => setOpenModal('searchRoute')}><FaSearch /> Search Route</button>
          <button className="actionButton" onClick={() => setOpenModal('searchBusStop')}><FaSearch /> Search Bus Stop</button>
        </div>

        {/* Modals */}
        <AddRouteModal isOpen={openModal === 'addRoute'} onClose={() => setOpenModal('')} />
        <AddBusStopModal isOpen={openModal === 'addBusStop'} onClose={() => setOpenModal('')} />
        <EditRouteModal isOpen={openModal === 'editRoute'} onClose={() => setOpenModal('')} />
        <EditBusStopModal isOpen={openModal === 'editBusStop'} onClose={() => setOpenModal('')} />
        <RemoveRouteModal isOpen={openModal === 'removeRoute'} onClose={() => setOpenModal('')} />
        <RemoveBusStopModal isOpen={openModal === 'removeBusStop'} onClose={() => setOpenModal('')} />
        {/* <ViewStatisticsModal isOpen={openModal === 'viewStats'} onClose={() => setOpenModal('')} /> */}
        <SearchRouteModal isOpen={openModal === 'searchRoute'} onClose={() => setOpenModal('')} />
        <SearchBusStopModal isOpen={openModal === 'searchBusStop'} onClose={() => setOpenModal('')} />
      </main>

      {/* Footer */}
      <footer style={styles.bottomNav}>
        <button style={styles.navButton} aria-label="Home" onClick={handleHome}>
          <FaHome style={styles.navIcon} />
          <span>Home</span>
        </button>
        <button style={styles.navButton} aria-label="Logout" onClick={handleLogout}>
          <FaSignOutAlt style={styles.navIcon} />
          <span>Logout</span>
        </button>
      </footer>

      {/* Inline CSS for responsive layout */}
      <style>{`
        .buttonGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(40%, 1fr));
          gap: 15px;
          width: 100%;
          max-width: 600px;
        }

        .actionButton {
          background-color: #FFDB15;
          color: black;
          border: none;
          border-radius: 20px;
          padding: 2vh 2vw;
          font-size: 1em;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          min-height: 8vh;
        }

        @media (max-width: 480px) {
          .buttonGrid {
            grid-template-columns: 1fr;
          }
          .actionButton {
            font-size: 0.9em;
            min-height: 7vh;
          }
        }
      `}</style>
    </div>
  );
};

// Styles remain unchanged
const styles = {
  dashboard: {
    backgroundColor: '#121212',
    color: 'white',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    margin: 0,
    overflow: 'hidden',
  },
  header: {
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  logoContainer: {
    backgroundColor: '#333',
    borderRadius: '50%',
    padding: '10px',
    marginRight: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: '1.5em',
  },
  userInfo: {
    textAlign: 'left',
  },
  userName: {
    margin: 0,
    fontWeight: 'bold',
    color: '#FFDB15',
  },
  userRole: {
    margin: 0,
    fontSize: '0.9em',
    color: '#ccc',
  },
  notificationIcon: {
    fontSize: '1.5em',
  },
  mainContent: {
    flexGrow: 1,
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  bottomNav: {
    backgroundColor: '#00A3A3',
    display: 'flex',
    justifyContent: 'space-around',
    padding: '10px 0',
    borderTopLeftRadius: '25px',
    borderTopRightRadius: '25px',
  },
  navButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontSize: '0.8em',
    gap: '4px',
  },
  navIcon: {
    fontSize: '1.8em',
  }
};

export default AdminDashboard;
