import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/ChatWindow';
import { AuthContext } from './context/AuthContext';
import type { User } from './types/User';
import type { JSX } from 'react';
import { jwtDecode } from 'jwt-decode';
import TicketPostForm from './pages/TicketPostForm';
import EmployeeDashboard from './pages/EmployeeDashboard';


function PrivateRoute({ children }: { children: JSX.Element }): JSX.Element {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user && user.token && user._id ? children : <Navigate to="/login" />;
}


function App() {
    // This state holds your current user object
    const [user, setUser] = useState<User | null>(null);

    //fetch user if logged in
    useEffect(() => {
        // Try to restore user from localStorage (ONE place only!)
        const saved = localStorage.getItem("user");
        if (saved) {
            setUser(JSON.parse(saved));
            console.log("GET ITEM - 1");
            return;
        }

        // Fallback: reconstruct from a bare "token" if present (rarely needed)
        const token = localStorage.getItem("token");
        console.log("GET ITEM - 2");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Make sure all keys match what your code expects
                const userObj = {
                    _id: decoded._id,
                    name: decoded.name,
                    role: decoded.role,
                    token // <-- use actual JWT string!
                };
                setUser(userObj); // Updates the AuthContext
                localStorage.setItem('user', JSON.stringify(userObj));
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
                    <Route path="/tickets/new" element={<TicketPostForm />} />
                    <Route path="/employee/dashboard" element={
                         <EmployeeDashboard />
                    } />
                </Routes>
            </BrowserRouter>
        </AuthContext.Provider>
    );
}

export default App;
