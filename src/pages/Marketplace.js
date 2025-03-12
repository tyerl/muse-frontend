// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Home = () => {
  return (
    <div className="min-h-screen bg-gallery-bg dark:bg-dark-bg">
      <Navbar />
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <h1 className="text-4xl font-bold text-art-black dark:text-highlight mb-4">muse Marketplace</h1>
        <p className="text-lg text-gray-700 dark:text-highlight mb-8">A marketplace for the art(ists). Built on Ethereum Classic.</p>
        <div className="space-x-4">
          <Link to="/marketplace" className="bg-highlight text-white px-6 py-2 rounded hover:bg-yellow-600">Explore Marketplace</Link>
          <Link to="/artist-dashboard" className="border border-highlight text-highlight px-6 py-2 rounded hover:bg-highlight hover:text-white">For Artists</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
