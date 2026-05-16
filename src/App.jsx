import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainLayout from './layouts/MainLayout';
import Login from './modules/auth/Login';
import Register from './modules/auth/Register';
import { ConfirmProvider } from './components/ui/ConfirmDialog';

function FlyonUIInit({ children }) {
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.HSStaticMethods && typeof window.HSStaticMethods.autoInit === 'function') {
        window.HSStaticMethods.autoInit();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return children;
}

export default function App() {
  return (
    <ConfirmProvider>
      <BrowserRouter>
        <FlyonUIInit>
          <Toaster position="top-right" toastOptions={{
            style: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '13px' }
          }} />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Single Page Tab ERP Route */}
            <Route path="/app" element={<MainLayout />} />
            


            <Route path="/" element={<Navigate to="/app" replace />} />
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Routes>
        </FlyonUIInit>
      </BrowserRouter>
    </ConfirmProvider>
  );
}
