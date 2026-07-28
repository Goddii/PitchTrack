import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wrap any <Route element={...}> that requires login (and optionally admin role).
// Usage: <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
//        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />
export default function ProtectedRoute({ children, adminOnly = false }) {
    const { isAuthenticated, isAdmin, loading } = useAuth();
    const location = useLocation();
    
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-night">
                <p className="font-body text-sm text-chalk/50 uppercase tracking-widest2">Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Send visitors to login, remembering where they were headed so we can
        // bounce them back after a successful sign-in.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}