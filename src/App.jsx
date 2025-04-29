import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import './css/style.css';
import './charts/ChartjsConfig';

import AppRoutes from './routes'; // Import routes dari file terpisah
// Import pages
import Dashboard from './pages/Dashboard';
import Report from './pages/Report';


function App() {

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    document.querySelector('html').style.scrollBehavior = 'auto';
    window.scroll({ top: 0 });
    document.querySelector('html').style.scrollBehavior = '';
  }, [location.pathname]);

  return null;
}

function AppWrapper() {
  return (
    <>
      <ScrollToTop />
      <AppRoutes />
      <Routes>
        <Route exact path="/" element={<Dashboard />} />
        <Route exact path="/report" element={<Report />} />

      </Routes>

    </>
  );
}

export default function App() {
  return (
    <AppWrapper />
  );
}
