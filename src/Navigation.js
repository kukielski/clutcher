import React from 'react';
import { Link } from 'react-router-dom'; // For navigation links

function Navigation() {
  return (
    <nav>
      <ul>
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/registration">Registration</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/videos">Videos</Link></li>
        <li><Link to="/products">Products</Link></li>
      </ul>
    </nav>
  );
}

export default Navigation;
