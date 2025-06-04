// src/components/AdminProtected.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminProtected = ({ children }) => {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminProtected;
