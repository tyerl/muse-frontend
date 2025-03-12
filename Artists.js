// src/pages/Artists.js
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

const Artists = () => {
  const [top8, setTop8] = useState(Array(8).fill(''));
  const [featuredArtists, setFeaturedArtists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setFeaturedArtists([
        { id: 1, name: 'Crypto Picasso', handle: '@cryptopicasso', followers: 2405 },
        { id: 2, name: 'BlockchainBanksy', handle: '@bchainbanksy', followers: 1872 },
        { id: 3, name: 'NFT Wizard', handle: '@nftwizard', followers: 1204 },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const updateTop8 = (index, value) => {
    const newTop8 = [...top8];
    newTop8[index] = value;
    setTop8(newTop8);
  };

  const isProfileSaved = !!localStorage.getItem('artistName'); // Check if profile exists

  return (
    <div className="min-h-screen bg-gallery-bg dark:bg-dark-bg">
      <Navbar isProfileSaved={isProfileSaved} />
      <div className="max-w-6xl mx-auto py-12 px-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-art-black dark:text-highlight">
            Artists Hub
          </h2>
          <Link to="/artist-canvas" className="bg-highlight text-white px-4 py-2 rounded hover:bg-yellow-600">
            My Artist Canvas
          </Link>
        </div>

        <p className="text-gray-700 dark:text-highlight mb-6">
          Create and deploy your smart contracts here (coming soon).
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold text-art-black dark:text-highlight mb-4">Featured Artists</h3>
          {isLoading ? (
            <p className="text-gray-600 dark:text-gray-300">Loading featured artists...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredArtists.map(artist => (
                <div key={artist.id} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                  <h4 className="font-semibold text-art-black dark:text-highlight">{artist.name}</h4>
                  <p className="text-gray-600 dark:text-gray-300">{artist.handle}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{artist.followers} followers</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-art-black rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Your Top 8 Artists</h3>
          <div className="grid grid-cols-2 gap-4">
            {top8.map((artist, index) => (
              <input
                key={index}
                type="text"
                value={artist}
                onChange={(e) => updateTop8(index, e.target.value)}
                placeholder={`Artist #${index + 1} (e.g., @handle)`}
                className="p-2 border border-gray-600 rounded text-white bg-gray-800"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Artists;