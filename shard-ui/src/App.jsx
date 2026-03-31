import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './tokens.css';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import CreateSecret from './pages/CreateSecret';
import UnsealPage from './pages/UnsealPage';
import NodeStatus from './pages/NodeStatus';
import VaultList from './pages/VaultList';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/vaults':    'My Vaults',
  '/create':    'Create Secret',
  '/unseal':    'Unseal Vault',
  '/nodes':     'Node Status',
};

function Layout({ children, path }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ marginLeft: 220, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar title={pageTitles[path] ?? ''} />
        <main style={{ flex: 1, padding: 24 }}>{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<Navigate to="/login" replace />} />
        <Route path="/login"     element={<LoginPage />} />
        <Route path="/dashboard" element={<Layout path="/dashboard"><Dashboard /></Layout>} />
        <Route path="/vaults"    element={<Layout path="/vaults"><VaultList /></Layout>} />
        <Route path="/create"    element={<Layout path="/create"><CreateSecret /></Layout>} />
        <Route path="/unseal"    element={<Layout path="/unseal"><UnsealPage /></Layout>} />
        <Route path="/nodes"     element={<Layout path="/nodes"><NodeStatus /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}