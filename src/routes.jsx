import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import MasterData from './pages/MasterData';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/master-data" element={<MasterData />} />
    </Routes>
  );
}
