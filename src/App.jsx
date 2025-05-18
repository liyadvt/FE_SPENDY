import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import './css/style.css';
import './charts/ChartjsConfig';

// Import pages
import Dashboard from './pages/Dashboard';
import Report from './pages/Report';
import MasterData from './pages/MasterData';
import Login from './pages/Login';
import Transaction from './pages/Transaction';

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
      <Routes>
        <Route exact path="/login" element={<Login />} />
        <Route exact path="/dashboard" element={<Dashboard />} />
        <Route exact path="/master-data" element={<MasterData />} />
        <Route exact path="/transaction" element={<Transaction />} />
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

