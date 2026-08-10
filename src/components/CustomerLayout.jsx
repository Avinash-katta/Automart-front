import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const CustomerLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <div className="flex-grow">
        <Outlet />
      </div>
    </div>
  );
};

export default CustomerLayout;
