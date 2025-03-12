// src/pages/Marketplace.js
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

const FEATURED_IMAGES = [
  "http://localhost:8000/images/art5.png",
  "http://localhost:8000/images/art6.png",
  "http://localhost:8000/images/art7.png",
  "http://localhost:8000/images/art8.png",
  "http://localhost:8000/images/art9.png",
  "http://localhost:8000/images/art10.png",
  "http://localhost:8000/images/art11.png",
  "http://localhost:8000/images/art12.png",
  "http://localhost:8000/images/art13.png",
  "http://localhost:8000/images/art14.png",
  "http://localhost:8000/images/art15.png",
];

const FEATURED_ARTIST = {
  name: "Ling",
  xHandle: "@tyler_lengyel",
  walletAddress: "0x22035d938b3fe388586F362c3BCF5471383A2AC9",
};

const Marketplace = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % FEATURED_IMAGES.length);
    }, 500); // 0.5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gallery-bg dark:bg-dark-bg">
      <Navbar />
      <div className="max-w-6xl mx-auto py-12 px-4">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-art-black dark:text-highlight mb-4">
            Featured Artist.
          </h2>
          <Link to="/artist-canvas/0x22035d938b3fe388586F362c3BCF5471383A2AC9" className="block">
            <img
              src={FEATURED_IMAGES[currentImageIndex]}
              alt="Featured Artist Work"
              className="w-full max-w-md mx-auto h-64 object-contain rounded-lg shadow-md transition-all duration-500"
            />
          </Link>
          <div className="mt-4">
            <h3 className="text-xl font-semibold text-art-black dark:text-highlight">
              {FEATURED_ARTIST.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {FEATURED_ARTIST.xHandle}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {FEATURED_ARTIST.walletAddress.slice(0, 7)}...
            </p>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-art-black dark:text-highlight mb-6 text-center">
          NFT Marketplace (Coming Soon)
        </h1>
        <p className="text-gray-700 dark:text-gray-300 mb-8 text-center">
          Built for the Art. More to come. 
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((id) => (
            <div
              key={id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col items-center"
            >
              <img
                src={`http://localhost:8000/images/nft${id}.png`}
                alt={`NFT #${id}`}
                className="w-full h-48 object-contain rounded mb-4"
              />
              <h3 className="text-lg font-semibold text-art-black dark:text-highlight">
                NFT #{id}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">Demo</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
