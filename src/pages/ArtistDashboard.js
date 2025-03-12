// src/pages/ArtistDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const ArtistDashboard = () => {
  return (
    <div className="min-h-screen bg-gallery-bg dark:bg-dark-bg">
      <Navbar />
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h2 className="text-3xl font-bold text-art-black dark:text-highlight mb-4">
          muse Artist Dashboard
        </h2>
        <p className="text-gray-700 dark:text-highlight mb-6">
          Be your own muse.{' '}
          <Link 
            to="/artist-canvas" 
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Create your gallery here.
          </Link>
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-art-black dark:text-highlight mb-4">
            Welcome, Artist!
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            This is your starting point to create a unique profile for your NFT artwork.
            Click the link above to begin customizing your gallery space.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ArtistDashboard;
