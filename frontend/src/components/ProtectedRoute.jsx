import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ 
          border: '4px solid rgba(0, 0, 0, 0.1)', 
          borderTop: '4px solid var(--gold)', 
          borderRadius: '50%', 
          width: '40px', 
          height: '40px', 
          animation: 'spin 1s linear infinite' 
        }}>
          <style>{"\n            @keyframes spin {\n              0% { transform: rotate(0deg); }\n              100% { transform: rotate(360deg); }\n            }\n          "}</style>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
