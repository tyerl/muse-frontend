// src/components/Navbar.js
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { WalletContext } from '../context/WalletContext';

const Navbar = ({ isProfileSaved }) => {
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  const { walletAddress, hasProfile, isConnecting, connectionError, connectWallet } = useContext(WalletContext);
  const navigate = useNavigate();

  const handleDashboardClick = (e) => {
    if (hasProfile) {
      e.preventDefault();
      navigate('/artist-canvas');
    }
  };

  return (
    <nav className="bg-art-black text-white p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold lowercase">muse</Link>
        <div className="flex items-center space-x-6">
          <Link to="/" className="hover:text-highlight">Home</Link>
          <Link to="/marketplace" className="hover:text-highlight">Marketplace</Link>
          <Link
            to={hasProfile ? "/artist-canvas" : "/artist-dashboard"}
            onClick={handleDashboardClick}
            className="hover:text-highlight"
          >
            Artist Dashboard
          </Link>
          {isProfileSaved && (
            <Link to="/artists" className="hover:text-highlight">Artists</Link>
          )}
          {walletAddress ? (
            <span className="text-sm bg-gray-800 px-3 py-1 rounded">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
          ) : (
            <div className="flex flex-col items-end">
              <button
                onClick={connectWallet}
                className={`flex items-center bg-highlight text-white px-4 py-1 rounded hover:bg-yellow-600 transition-colors duration-200 ${
                  isConnecting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Connecting...
                  </>
                ) : (
                  'Connect Wallet'
                )}
              </button>
              {connectionError && (
                <div className="mt-2 text-sm text-red-400 flex items-center space-x-2">
                  <span>{connectionError}</span>
                  <button
                    onClick={connectWallet}
                    className="underline hover:text-red-300"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors duration-200"
          >
            {darkMode ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;