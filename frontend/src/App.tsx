import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/ChatWindow';
import { AuthContext } from './context/AuthContext';
import type { User } from './types/User';
import type { JSX } from 'react';
import { jwtDecode } from 'jwt-decode';


function PrivateRoute({ children }: { children: JSX.Element }): JSX.Element {
    // You can make this smarter (check JWT expiry, etc), but for now just check token
    return localStorage.getItem('token') ? children : <Navigate to="/login" />;
}

function App() {
    // This state holds your current user object
    const [user, setUser] = useState<User | null>(null);

    //fetch user if logged in
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                // The shape of the decoded object depends on your backend JWT payload
                // Typical payload: { sub: userId, name: userName, email: userEmail }
                console.log("Token from localStorage:", token);


                const decoded = jwtDecode(token);
                console.log("Decoded JWT:", decoded);


                // You MUST match these keys to your backend's JWT claims
                setUser({
                    _id: decoded.sub || decoded.id || decoded.userId, // fallback to whatever claim you find
                    name: decoded.name || decoded.username || ""
                });

            } catch (err) {
                setUser(null);
            }
        } else {
            setUser(null);
        }
    }, []);

    return (
        <AuthContext.Provider value={user}>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={
                        <Login setUser={setUser} />   // Pass setUser to log in
                    } />
                    <Route path="/register" element={<Register />} />
                    <Route path="/chat" element={
                        <PrivateRoute>
                            <Chat />
                        </PrivateRoute>
                    } />
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </BrowserRouter>
        </AuthContext.Provider>
    );
}

export default App;
