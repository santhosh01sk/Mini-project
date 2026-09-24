import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminOverview, getAdminLogs, executeAdminQuery } from '../services/api';
import './Admin.css';

const AdminPage = () => {
  const navigate = useNavigate();

  // State
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'logs' | 'query'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Overview Data
  const [overview, setOverview] = useState({
    summary: {
      total_users: 0,
      total_posts: 0,
      total_likes: 0,
      total_comments: 0,
      total_friendships: 0,
    },
    users: [],
  });

  // Logs Data
  const [logs, setLogs] = useState([]);
  const [logFilter, setLogFilter] = useState('ALL');
  const [logSearch, setLogSearch] = useState('');

  // User Filter & Sort
  const [userSearch, setUserSearch] = useState('');
  const [userSort, setUserSort] = useState('posts-desc');
  const [expandedUserFriends, setExpandedUserFriends] = useState({});

  // Query Console State
  const [queryInput, setQueryInput] = useState('');
  const [queryResults, setQueryResults] = useState(null);
  const [queryLoading, setQueryLoading] = useState(false);

  // Fetch admin data on mount
  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, logsData] = await Promise.all([
        getAdminOverview(),
        getAdminLogs(),
      ]);
      setOverview(overviewData);
      setLogs(logsData || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setError('Unable to load admin analytics. Please verify server connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const toggleUserFriends = (userId) => {
    setExpandedUserFriends((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleRunQuery = async (queryText) => {
    const q = (queryText || queryInput).trim();
    if (!q) return;
    setQueryLoading(true);
    try {
      const data = await executeAdminQuery(q);
      setQueryResults(data);
    } catch (err) {
      setQueryResults({ error: err.response?.data?.error || err.message });
    } finally {
      setQueryLoading(false);
    }
  };

  // Filter & Sort Users
  const filteredUsers = useMemo(() => {
    if (!overview.users) return [];
    let list = [...overview.users];

    if (userSearch.trim()) {
      const s = userSearch.toLowerCase();
      list = list.filter(
        (u) =>
          u.username?.toLowerCase().includes(s) ||
          u.email?.toLowerCase().includes(s) ||
          String(u.user_id).includes(s)
      );
    }

    list.sort((a, b) => {
      switch (userSort) {
        case 'posts-desc':
          return (b.post_count || 0) - (a.post_count || 0);
        case 'likes-desc':
          return (b.total_post_likes || 0) - (a.total_post_likes || 0);
        case 'comments-desc':
          return ((b.comment_count || 0) + (b.comments_received || 0)) - ((a.comment_count || 0) + (a.comments_received || 0));
        case 'friends-desc':
          return (b.friend_count || 0) - (a.friend_count || 0);
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        default:
          return 0;
      }
    });

    return list;
  }, [overview.users, userSearch, userSort]);

  // Filter Logs
  const filteredLogs = useMemo(() => {
    let list = [...logs];
    if (logFilter !== 'ALL') {
      list = list.filter((item) => item.type === logFilter);
    }
    if (logSearch.trim()) {
      const s = logSearch.toLowerCase();
      list = list.filter(
        (item) =>
          item.actor?.toLowerCase().includes(s) ||
          item.email?.toLowerCase().includes(s) ||
          item.details?.toLowerCase().includes(s)
      );
    }
    return list;
  }, [logs, logFilter, logSearch]);

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const getLogBadgeClass = (type) => {
    switch (type) {
      case 'REGISTRATION':
        return 'badge-registration';
      case 'POST':
        return 'badge-post';
      case 'COMMENT':
        return 'badge-comment';
      case 'LIKE':
        return 'badge-like';
      case 'FRIEND_REQUEST':
        return 'badge-friend';
      case 'MESSAGE':
        return 'badge-message';
      default:
        return 'badge-default';
    }
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'REGISTRATION':
        return '👤';
      case 'POST':
        return '📝';
      case 'COMMENT':
        return '💬';
      case 'LIKE':
        return '❤️';
      case 'FRIEND_REQUEST':
        return '🤝';
      case 'MESSAGE':
        return '✉️';
      default:
        return '⚡';
    }
  };

  return (
    <div className="admin-portal">
      {/* Background ambient lighting */}
      <div className="admin-ambient-glow" />

      {/* Navigation Header */}
      <header className="admin-header">
        <div className="admin-header-brand">
          <div className="admin-logo-mark">⚡</div>
          <div>
            <div className="admin-brand-title">
              Mini Social <span className="admin-badge">ADMIN PORTAL</span>
            </div>
            <div className="admin-system-status">
              <span className="status-dot"></span> System Live & Operational
            </div>
          </div>
        </div>

        <div className="admin-header-actions">
          <button
            className="admin-btn admin-btn-secondary"
            onClick={fetchAdminData}
            title="Refresh dashboard metrics"
            disabled={loading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            Refresh
          </button>

          <button
            className="admin-btn admin-btn-secondary"
            onClick={() => navigate('/home')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            App Feed
          </button>

          <button className="admin-btn admin-btn-danger" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </header>

      {/* Error Notice */}
      {error && (
        <div className="admin-alert admin-alert-error">
          <span>⚠️ {error}</span>
          <button onClick={fetchAdminData}>Retry</button>
        </div>
      )}

      {/* Top Platform KPI Metrics */}
      <section className="admin-kpi-grid">
        <div className="admin-kpi-card card-users">
          <div className="kpi-header">
            <span className="kpi-title">Total Users</span>
            <span className="kpi-icon">👥</span>
          </div>
          <div className="kpi-value">{overview.summary.total_users}</div>
          <div className="kpi-subtext">Registered platform accounts</div>
        </div>

        <div className="admin-kpi-card card-posts">
          <div className="kpi-header">
            <span className="kpi-title">Total Posts</span>
            <span className="kpi-icon">📝</span>
          </div>
          <div className="kpi-value">{overview.summary.total_posts}</div>
          <div className="kpi-subtext">Published across all feeds</div>
        </div>

        <div className="admin-kpi-card card-likes">
          <div className="kpi-header">
            <span className="kpi-title">Total Likes</span>
            <span className="kpi-icon">❤️</span>
          </div>
          <div className="kpi-value">{overview.summary.total_likes}</div>
          <div className="kpi-subtext">Post reactions recorded</div>
        </div>

        <div className="admin-kpi-card card-comments">
          <div className="kpi-header">
            <span className="kpi-title">Total Comments</span>
            <span className="kpi-icon">💬</span>
          </div>
          <div className="kpi-value">{overview.summary.total_comments}</div>
          <div className="kpi-subtext">Discussions & responses</div>
        </div>

        <div className="admin-kpi-card card-friends">
          <div className="kpi-header">
            <span className="kpi-title">Friendships</span>
            <span className="kpi-icon">🤝</span>
          </div>
          <div className="kpi-value">{overview.summary.total_friendships}</div>
          <div className="kpi-subtext">Active friend connections</div>
        </div>
      </section>

      {/* Main Tab Controls */}
      <nav className="admin-tabs">
        <button
          className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <span className="tab-icon">👥</span>
          <span>Users & Networks</span>
          <span className="tab-badge">{overview.users.length}</span>
        </button>

        <button
          className={`admin-tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          <span className="tab-icon">📜</span>
          <span>System Activity Logs</span>
          <span className="tab-badge">{logs.length}</span>
        </button>

        <button
          className={`admin-tab-btn ${activeTab === 'query' ? 'active' : ''}`}
          onClick={() => setActiveTab('query')}
        >
          <span className="tab-icon">💻</span>
          <span>Query Console</span>
        </button>
      </nav>

      {/* TAB 1: USERS & NETWORKS */}
      {activeTab === 'users' && (
        <section className="admin-tab-content">
          {/* Controls Bar */}
          <div className="admin-controls-bar">
            <div className="admin-search-wrapper">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search users by username, email, ID..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
              {userSearch && (
                <button className="clear-search" onClick={() => setUserSearch('')}>×</button>
              )}
            </div>

            <div className="admin-sort-wrapper">
              <label>Sort By:</label>
              <select value={userSort} onChange={(e) => setUserSort(e.target.value)}>
                <option value="posts-desc">Most Posts</option>
                <option value="likes-desc">Most Likes Received</option>
                <option value="comments-desc">Most Comments Activity</option>
                <option value="friends-desc">Most Friends</option>
                <option value="newest">Newest Registered</option>
                <option value="oldest">Earliest Registered</option>
              </select>
            </div>
          </div>

          {/* User Cards / Table */}
          {loading ? (
            <div className="admin-loading-state">
              <div className="spinner"></div>
              <p>Aggregating user metrics and network relations...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="admin-empty-state">
              <p>No users found matching "{userSearch}".</p>
            </div>
          ) : (
            <div className="users-card-grid">
              {filteredUsers.map((user) => {
                const isExpanded = !!expandedUserFriends[user.user_id];
                const friendsList = user.friends || [];

                return (
                  <div key={user.user_id} className="user-profile-admin-card">
                    {/* Header info */}
                    <div className="user-card-head">
                      <div className="user-avatar-wrap">
                        {user.profile_img ? (
                          <img
                            src={`http://localhost:5000/uploads/${user.profile_img}`}
                            alt={user.username}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : null}
                        <div className="avatar-fallback">
                          {(user.username || 'U').charAt(0).toUpperCase()}
                        </div>
                      </div>

                      <div className="user-card-names">
                        <div className="user-title-row">
                          <h3 className="user-name">{user.username}</h3>
                          <span className="user-id-badge">ID #{user.user_id}</span>
                        </div>
                        <p className="user-email">{user.email}</p>
                        <span className="user-joined">
                          Joined {formatDate(user.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Stats Metrics Grid */}
                    <div className="user-metrics-row">
                      <div className="metric-pill pill-posts" title="Total posts created by this user">
                        <span className="metric-label">Posts</span>
                        <span className="metric-num">{user.post_count || 0}</span>
                      </div>

                      <div className="metric-pill pill-likes" title="Total likes received across all posts">
                        <span className="metric-label">Post Likes</span>
                        <span className="metric-num">❤️ {user.total_post_likes || 0}</span>
                      </div>

                      <div className="metric-pill pill-comments" title="Authored comments & comments received on their posts">
                        <span className="metric-label">Comments</span>
                        <span className="metric-num">
                          💬 {user.comment_count || 0}
                          <small title="Comments received on posts" style={{ fontSize: '0.75rem', opacity: 0.8, marginLeft: '4px' }}>
                            ({user.comments_received || 0} rcvd)
                          </small>
                        </span>
                      </div>

                      <div className="metric-pill pill-friends" title="Active mutual friends">
                        <span className="metric-label">Friends</span>
                        <span className="metric-num">🤝 {user.friend_count || 0}</span>
                      </div>
                    </div>

                    {/* Friends Section Expander */}
                    <div className="user-friends-section">
                      <button
                        className="toggle-friends-btn"
                        onClick={() => toggleUserFriends(user.user_id)}
                      >
                        <span>
                          {isExpanded ? 'Hide Friends Network' : `View Friends (${friendsList.length})`}
                        </span>
                        <svg
                          className={`chevron ${isExpanded ? 'rotated' : ''}`}
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>

                      {isExpanded && (
                        <div className="friends-dropdown-list">
                          {friendsList.length === 0 ? (
                            <p className="no-friends-text">This user has no connected friends yet.</p>
                          ) : (
                            <div className="friends-chips-container">
                              {friendsList.map((friend) => (
                                <div key={friend.user_id} className="friend-chip">
                                  <div className="chip-avatar">
                                    {(friend.username || 'F').charAt(0).toUpperCase()}
                                  </div>
                                  <div className="chip-info">
                                    <span className="chip-name">{friend.username}</span>
                                    <span className="chip-email">{friend.email}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* TAB 2: SYSTEM ACTIVITY LOGS */}
      {activeTab === 'logs' && (
        <section className="admin-tab-content">
          {/* Logs Filter Controls */}
          <div className="logs-header-bar">
            <div className="log-filter-pills">
              {[
                { id: 'ALL', label: 'All Activities', icon: '⚡' },
                { id: 'REGISTRATION', label: 'Registrations', icon: '👤' },
                { id: 'POST', label: 'Posts', icon: '📝' },
                { id: 'COMMENT', label: 'Comments', icon: '💬' },
                { id: 'LIKE', label: 'Likes', icon: '❤️' },
                { id: 'FRIEND_REQUEST', label: 'Friend Requests', icon: '🤝' },
                { id: 'MESSAGE', label: 'Direct Messages', icon: '✉️' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  className={`log-pill-btn ${logFilter === pill.id ? 'active' : ''}`}
                  onClick={() => setLogFilter(pill.id)}
                >
                  <span>{pill.icon}</span> {pill.label}
                </button>
              ))}
            </div>

            <div className="logs-search-wrapper">
              <input
                type="text"
                placeholder="Filter logs by actor, keyword..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
              />
              {logSearch && (
                <button className="clear-search" onClick={() => setLogSearch('')}>×</button>
              )}
            </div>
          </div>

          {/* Logs Feed */}
          {loading ? (
            <div className="admin-loading-state">
              <div className="spinner"></div>
              <p>Fetching platform audit logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="admin-empty-state">
              <p>No activity logs match the selected filter.</p>
            </div>
          ) : (
            <div className="admin-logs-timeline">
              <div className="timeline-count-badge">
                Showing {filteredLogs.length} events (most recent first)
              </div>
              <div className="timeline-stream">
                {filteredLogs.map((log, index) => (
                  <div key={index} className="log-entry-row">
                    <div className="log-type-icon-col">
                      <span className={`log-circle-icon ${getLogBadgeClass(log.type)}`}>
                        {getLogIcon(log.type)}
                      </span>
                    </div>

                    <div className="log-entry-content">
                      <div className="log-entry-top">
                        <span className={`log-type-tag ${getLogBadgeClass(log.type)}`}>
                          {log.type.replace('_', ' ')}
                        </span>
                        <span className="log-actor-name">{log.actor}</span>
                        <span className="log-actor-email">({log.email})</span>
                        <span className="log-timestamp">{formatDate(log.created_at)}</span>
                      </div>
                      <div className="log-entry-details">{log.details}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* TAB 3: QUERY CONSOLE */}
      {activeTab === 'query' && (
        <section className="admin-tab-content query-console-section">
          <div className="console-card">
            <div className="console-head">
              <h3>Admin Query Console</h3>
              <p>Execute custom English commands or natural-language inspection queries</p>
            </div>

            {/* Quick Suggestions */}
            <div className="query-suggestions">
              <span className="suggest-label">Suggestions:</span>
              <button
                className="suggest-btn"
                onClick={() => {
                  setQueryInput('display all users');
                  handleRunQuery('display all users');
                }}
              >
                display all users
              </button>
              <button
                className="suggest-btn"
                onClick={() => {
                  setQueryInput('get the posts sent by sivakumar.smsd');
                  handleRunQuery('get the posts sent by sivakumar.smsd');
                }}
              >
                get the posts sent by sivakumar.smsd
              </button>
              <button
                className="suggest-btn"
                onClick={() => {
                  setQueryInput('get the comments sent by test_hero');
                  handleRunQuery('get the comments sent by test_hero');
                }}
              >
                get the comments sent by test_hero
              </button>
            </div>

            <div className="console-input-row">
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="e.g. display all users, get details of user <username>, get posts sent by <username>"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRunQuery();
                }}
              />
              <button
                className="admin-btn admin-btn-primary"
                onClick={() => handleRunQuery()}
                disabled={queryLoading}
              >
                {queryLoading ? 'Executing...' : 'Run Query'}
              </button>
            </div>

            {/* Query Output */}
            {queryResults && (
              <div className="console-output-box">
                <div className="output-header">
                  <span>Output Result:</span>
                  <button className="copy-btn" onClick={() => navigator.clipboard.writeText(JSON.stringify(queryResults, null, 2))}>
                    Copy JSON
                  </button>
                </div>
                <pre>{JSON.stringify(queryResults, null, 2)}</pre>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default AdminPage;