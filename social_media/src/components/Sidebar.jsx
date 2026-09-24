
import React from 'react';
import { useNavigate } from 'react-router-dom';
const Sidebar = () => {
    const navigate =useNavigate();
    const handleFriend = (e) => {
        e.preventDefault();
        navigate("/friends");
    }
    const handleHome = (e) => {
        e.preventDefault();
        navigate('/home');
      }
      const handleProfile = (e) => {
        e.preventDefault();
        navigate("/profile");
      }
    return (
        <div className="sidebar-nav">
            <button onClick={handleHome} className="sidebar-link">Home</button>
            <button onClick={handleProfile} className="sidebar-link">Profile</button>
            <button onClick={handleFriend} className="sidebar-link">Friends</button>
            {localStorage.getItem('isAdmin') === 'true' && (
              <button 
                onClick={(e) => { e.preventDefault(); navigate('/admin'); }} 
                className="sidebar-link"
                style={{ borderColor: 'rgba(99, 102, 241, 0.4)', color: '#818cf8' }}
              >
                ⚡ Admin Portal
              </button>
            )}
            <div className="sidebar-note">
              Connect, post, and chat from one place.
            </div>
        </div>
    );
};

export default Sidebar;

