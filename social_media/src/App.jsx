import React from "react";
import Register from "./components/Register"
import Home from "./components/Home"
import Login from "./components/Login"
import Post2 from "./components/post2";
import Friend from "./components/Friend"
import Chat from "./components/Chat"
import Profile from "./components/Profile"
import AdminPage from "./components/Admin";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

const isAuthenticated = () => Boolean(localStorage.getItem('token'));

const PublicOnlyRoute = ({ children }) => {
    return isAuthenticated() ? <Navigate to="/home" replace /> : children;
};

const ProtectedRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

function App(){
    return(
        <Router>
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
            <Route path="/login" element={<PublicOnlyRoute><Login/></PublicOnlyRoute>} />
            <Route path="/home" element={<ProtectedRoute><Home/></ProtectedRoute>} />
            <Route path="/post2" element={<ProtectedRoute><Post2/></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>} />
            <Route path="/friends" element={<ProtectedRoute><Friend/></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chat/></ProtectedRoute>} />
            <Route path="/admin" element={<AdminPage/>}/>
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>  
    </Router>
    );
}
export default App;