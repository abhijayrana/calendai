
import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-sky-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <span className="text-white font-bold text-lg">Calendai</span>
          </div>
          <div className="flex">
            <a style={{ textDecoration: 'none' }} href="/" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Home</a>
            <a style={{ textDecoration: 'none' }} href="/calendar" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Calendar</a>
            {/* <a href="#" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Contact</a> */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
