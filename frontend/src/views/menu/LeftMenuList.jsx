import React from 'react';
import { Link } from 'react-router-dom'; // Để sử dụng Link nếu bạn sử dụng React Router

const LeftListMenu = () => {
  return (
      <div className="w-64 bg-gray-800 text-white h-screen p-4 fixed ">
        <h2 className="text-xl font-semibold mb-4">Menu</h2>
        <ul className="space-y-2">
          <li>
            <Link to="/" className="block p-2 hover:bg-gray-600 rounded">
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" className="block p-2 hover:bg-gray-600 rounded">
              About
            </Link>
          </li>
          <li>
            <Link to="/services" className="block p-2 hover:bg-gray-600 rounded">
              Services
            </Link>
          </li>
          <li>
            <Link to="/contact" className="block p-2 hover:bg-gray-600 rounded">
              Contact
            </Link>
          </li>
        </ul>
      </div>

  );
};

export default LeftListMenu;
