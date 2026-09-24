import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { jwtDecode } from 'jwt-decode';
import { Link, useNavigate } from "react-router-dom";
import { getFriendPosts } from "../services/api";
import Post from "./Post";
import Comment from './Comment';
import LikeButton from './LikeButton';
import "./Home.css";
import "./Feed.css";

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

function Home(){
  const navigate = useNavigate();
  const userId = getUserIdFromToken();
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    try{
      const data = await getFriendPosts(userId);
      setPosts(data);
    }
    catch(error){
        console.log(error.message);
    }
  }
  const handleDelete = (postId) => {
    setPosts(posts.filter(post => post.id !== postId));
  };
  useEffect(() => {
    fetchPosts();
  }, []);
  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

    return(
      <div className="home-shell">
        <Navbar/>

        <div className="dashboard-hero">
          <div className="hero-copy-block">
            <p className="eyebrow">Your feed</p>
            <h1>See what your friends are sharing.</h1>
            <p className="hero-copy">A cleaner dashboard for posts, likes, comments, and conversations.</p>
          </div>
          <button onClick={logout} className="refresh-button-logout">Logout</button>
          <div className="hero-metrics">
            <div className="metric-card">
              <span>Posts</span>
              <strong>{posts.length}</strong>
            </div>
            <div className="metric-card">
              <span>Status</span>
              <strong>Active</strong>
            </div>
          </div>
        </div>

        <div className="fullpage">
          <aside className="side sidebar-panel">
            <Sidebar/>
          </aside>

          <main className="post feed-panel">
            <div className="feed-topbar">
              <div>
                <p className="eyebrow">Feed</p>
                <h2>Latest posts</h2>
              </div>
              <Link to="/post2" className="create-post-button">
                Create a new post
              </Link>
            </div>

            <div className="feed-list">
              {posts.length === 0 && <div className="empty-state">No posts yet. Start the conversation.</div>}
              {posts.map(post => (
                <div className="main-post-content" key={post.id}>
                  <Post post={post} userId={userId} onDelete={handleDelete}/>
                  <div className="post-actions">
                    <LikeButton postId={post.id} />
                    <Comment postId={post.id}  />
                  </div>
                </div>
              ))}
            </div>
          </main>

          <aside className="activities sidebar-panel">
            <p className="eyebrow">Activity</p>
            <h2>Quick tips</h2>
            <ul className="activity-list">
              <li>Create a post to appear in your friends' feed.</li>
              <li>Use the Friends page to accept requests and chat.</li>
              <li>Update your profile image from the profile page.</li>
            </ul>
          </aside>
        </div>
      </div>
    );
}
export default Home;