import React, { useState, useEffect, useRef } from "react";
import "./Profile.css";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile } from "../services/api";

const getUserIdFromToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const decodedToken = jwtDecode(token);
    return decodedToken.user_id;
  } catch (error) {
    console.error("Failed to decode token", error);
    return null;
  }
};

function Profile() {
  const navigate = useNavigate();
  const userId = getUserIdFromToken();
  const fileInputRef = useRef(null);
  const fallbackAvatar = '/default-avatar.svg';

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchUserDetails = async () => {
      try {
        const user = await getProfile(userId);
        if (user) {
          setUsername(user.username || "");
          setEmail(user.email || "");
          setPreviewImage(user.profile_img ? `http://localhost:5000/uploads/${user.profile_img}` : fallbackAvatar);
        }
      } catch (error) {
        console.warn("Could not fetch user details from /api/profile, trying token fallback:", error);
        // Fallback from token
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const decoded = jwtDecode(token);
            if (decoded.username) setUsername(decoded.username);
          } catch (e) {
            console.error(e);
          }
        }
      }
    };

    fetchUserDetails();
  }, [userId]);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification('error', 'Please choose a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    setProfileImage(file);
    setPreviewImage(URL.createObjectURL(file));
    showNotification('success', 'Photo selected. Click "Save Changes" to apply.');
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      showNotification('error', 'Username cannot be blank.');
      return;
    }
    if (!email.trim()) {
      showNotification('error', 'Email address cannot be blank.');
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("username", username.trim());
    formData.append("email", email.trim());
    if (password.trim()) formData.append("password", password.trim());
    if (profileImage) formData.append("profileImage", profileImage);

    try {
      const response = await updateProfile(formData);
      if (response && response.user) {
        showNotification('success', 'Profile updated successfully!');
        if (response.user.profile_img) {
          setPreviewImage(`http://localhost:5000/uploads/${response.user.profile_img}`);
        }
        setPassword("");
        setProfileImage(null);
      } else {
        showNotification('success', 'Profile updated successfully!');
        setPassword("");
        setProfileImage(null);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showNotification('error', error.response?.data?.error || error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="profile-page">
      {/* Top Navbar Header */}
      <header className="profile-topbar">
        <div className="topbar-left">
          <button type="button" className="nav-back-button" onClick={() => navigate('/home')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Feed
          </button>
          <span className="topbar-divider">/</span>
          <span className="topbar-crumb">Profile Settings</span>
        </div>

        <button type="button" className="profile-logout-button" onClick={handleLogout}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Log Out
        </button>
      </header>

      {/* Main Container */}
      <div className="profile-content-shell">
        <div className="profile-title-block">
          <p className="profile-eyebrow">Account Settings</p>
          <h1>Customize Your Profile</h1>
          <p className="profile-subtitle">Update your personal details, profile avatar, and security credentials.</p>
        </div>

        {/* Dynamic Toast / Status Banner */}
        {notification && (
          <div className={`profile-toast toast-${notification.type}`}>
            <span className="toast-icon">
              {notification.type === 'success' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              )}
            </span>
            <span className="toast-text">{notification.message}</span>
            <button type="button" className="toast-close" onClick={() => setNotification(null)}>×</button>
          </div>
        )}

        <div className="profile-main-grid">
          {/* LEFT COLUMN: IDENTITY & AVATAR CARD */}
          <aside className="profile-card identity-card">
            <div className="avatar-wrapper">
              <div className="avatar-container" onClick={triggerFileInput} title="Click to upload a new profile photo">
                <img
                  src={previewImage || fallbackAvatar}
                  alt="Profile Avatar"
                  className="avatar-image"
                  onError={(e) => { e.currentTarget.src = fallbackAvatar; }}
                />
                <div className="avatar-overlay">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <span>Change Photo</span>
                </div>
              </div>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: "none" }}
              />

              <button type="button" className="upload-photo-btn" onClick={triggerFileInput}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                {profileImage ? 'Change Selected Photo' : 'Upload New Photo'}
              </button>
            </div>

            <div className="identity-details">
              <h2 className="identity-name">{username || 'User Profile'}</h2>
              <p className="identity-email">{email || 'No email attached'}</p>

              <div className="identity-badges">
                <span className="id-badge">
                  <span className="dot active"></span>
                  Active Member
                </span>
                {userId && <span className="id-badge">ID #{userId}</span>}
              </div>
            </div>

            <div className="identity-tip">
              <p>
                <strong>Pro Tip:</strong> Square PNG or JPEG photos under 5MB look best. Your avatar appears beside your posts, comments, and messages.
              </p>
            </div>
          </aside>

          {/* RIGHT COLUMN: EDIT FORM */}
          <main className="profile-card form-card">
            <form onSubmit={handleSubmit} className="profile-form-new">
              <div className="form-section-header">
                <h3>Personal Information</h3>
                <p>Visible to other members across the social feed and community.</p>
              </div>

              {/* Username Field */}
              <div className="form-field-group">
                <label htmlFor="username-input">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Username
                </label>
                <div className="input-with-adornment">
                  <span className="adornment">@</span>
                  <input
                    id="username-input"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. alex_doe"
                    required
                  />
                </div>
                <span className="field-hint">Your unique username across friend requests, comments, and mentions.</span>
              </div>

              {/* Email Field */}
              <div className="form-field-group">
                <label htmlFor="email-input">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  Email Address
                </label>
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
                <span className="field-hint">Used for sign in and important account security notices.</span>
              </div>

              <div className="form-section-divider"></div>

              <div className="form-section-header">
                <h3>Security & Password</h3>
                <p>Leave blank if you do not want to change your current password.</p>
              </div>

              {/* Password Field */}
              <div className="form-field-group">
                <label htmlFor="password-input">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  New Password
                </label>
                <div className="input-with-button">
                  <input
                    id="password-input"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password (optional)"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                <span className="field-hint">Must be at least 6 characters if you decide to change it.</span>
              </div>

              {/* Form Action Buttons */}
              <div className="form-action-bar">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => navigate('/home')}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="save-changes-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="btn-spinner"></span>
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}

export default Profile;

