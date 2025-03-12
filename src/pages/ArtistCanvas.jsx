// src/pages/ArtistCanvas.jsx
import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import Navbar from '../components/Navbar';
import { WalletContext } from '../context/WalletContext';

const DEFAULT_PFP = "http://localhost:8000/images/pfp.png";
const DEFAULT_ARTWORKS = [
  "http://localhost:8000/images/art1.png",
  "http://localhost:8000/images/art2.png",
  "http://localhost:8000/images/art3.png",
  "http://localhost:8000/images/art4.png"
];

const TRAIT_CATEGORIES = {
  bg: [],
  color: [],
  wings: [],
  spikes: [],
  phil: [],
  top: [],
  nose: [],
  teeth: [],
  eyes: [],
};

const CONTRACT_ADDRESS = "0x72804E6D776DC57E2eE25A1fFB4C687Bf3cA6360";
const CONTRACT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "ProfileReset",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "artistName",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "xHandle",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "customHtml",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "profileTitle",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "artworkTitle",
        "type": "string"
      }
    ],
    "name": "ProfileSaved",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "getProfile",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "profiles",
    "outputs": [
      {
        "internalType": "string",
        "name": "artistName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "xHandle",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "customHtml",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "profileTitle",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "artworkTitle",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "exists",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "resetProfile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_artistName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_xHandle",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_customHtml",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_profileTitle",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_artworkTitle",
        "type": "string"
      }
    ],
    "name": "saveProfile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const ArtistCanvas = () => {
  const { walletAddress, hasProfile, refreshProfileStatus } = useContext(WalletContext);
  const { artistAddress } = useParams();
  const [artistName, setArtistName] = useState('');
  const [tempArtistName, setTempArtistName] = useState('');
  const [xHandle, setXHandle] = useState('');
  const [profileIcon, setProfileIcon] = useState(null);
  const [customHtml, setCustomHtml] = useState('<p>Your custom content here</p>');
  const [top4Artwork, setTop4Artwork] = useState(Array(4).fill(null));
  const [profileTitle, setProfileTitle] = useState('Your Profile');
  const [artworkTitle, setArtworkTitle] = useState('Top 4 Artwork');
  const [contract, setContract] = useState(null);
  const [activeTab, setActiveTab] = useState('layerzero');
  const [generatedNFTs, setGeneratedNFTs] = useState([]);
  const [userTraitCategories, setUserTraitCategories] = useState(null);
  const [userGeneratedNFTs, setUserGeneratedNFTs] = useState([]);
  const observerRef = useRef(null);
  const userObserverRef = useRef(null);

  useEffect(() => {
    const initContract = async () => {
      try {
        const response = await fetch('/traits/traits.json');
        const data = await response.json();
        TRAIT_CATEGORIES.bg = data.bg;
        TRAIT_CATEGORIES.color = data.color;
        TRAIT_CATEGORIES.wings = data.wings;
        TRAIT_CATEGORIES.spikes = data.spikes;
        TRAIT_CATEGORIES.phil = data.phil;
        TRAIT_CATEGORIES.top = data.top;
        TRAIT_CATEGORIES.nose = data.nose;
        TRAIT_CATEGORIES.teeth = data.teeth;
        TRAIT_CATEGORIES.eyes = data.eyes;
      } catch (error) {
        console.error("Error loading traits.json:", error);
      }

      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        setContract(contractInstance);

        const targetAddress = artistAddress || walletAddress;
        if (targetAddress) {
          if (targetAddress.toLowerCase() === "0x22035d938b3fe388586F362c3BCF5471383A2AC9".toLowerCase()) {
            setArtistName("Ling");
            setXHandle("@tyler_lengyel");
            setCustomHtml("<p>sup</p>");
            setProfileTitle("Itsa Me");
            setArtworkTitle("i like turtles");
            setProfileIcon(DEFAULT_PFP);
            setTop4Artwork(DEFAULT_ARTWORKS);
            generateInitialNFTs();
          } else if (hasProfile && !artistAddress) {
            try {
              const [name, handle, html, pTitle, aTitle] = await contractInstance.getProfile(walletAddress);
              setArtistName(name);
              setXHandle(handle);
              setCustomHtml(html);
              setProfileTitle(pTitle);
              setArtworkTitle(aTitle);
            } catch (error) {
              console.error("Error loading profile:", error);
            }
          } else if (artistAddress) {
            try {
              const [name, handle, html, pTitle, aTitle, exists] = await contractInstance.getProfile(artistAddress);
              if (exists) {
                setArtistName(name);
                setXHandle(handle);
                setCustomHtml(html);
                setProfileTitle(pTitle);
                setArtworkTitle(aTitle);
              }
            } catch (error) {
              console.error("Error loading artist profile:", error);
            }
          } else {
            setArtistName('');
            setXHandle('');
            setCustomHtml('<p>Your custom content here</p>');
            setProfileTitle('Your Profile');
            setArtworkTitle('Top 4 Artwork');
            setProfileIcon(null);
            setTop4Artwork(Array(4).fill(null));
            setGeneratedNFTs([]);
          }
        }
      }
    };
    initContract();
  }, [walletAddress, hasProfile, artistAddress]);

  const generateNFTs = () => {
    const newNFTs = Array.from({ length: 3 }, () => ({
      bg: TRAIT_CATEGORIES.bg[Math.floor(Math.random() * TRAIT_CATEGORIES.bg.length)],
      color: TRAIT_CATEGORIES.color[Math.floor(Math.random() * TRAIT_CATEGORIES.color.length)],
      wings: TRAIT_CATEGORIES.wings[Math.floor(Math.random() * TRAIT_CATEGORIES.wings.length)],
      spikes: TRAIT_CATEGORIES.spikes[Math.floor(Math.random() * TRAIT_CATEGORIES.spikes.length)],
      phil: TRAIT_CATEGORIES.phil[Math.floor(Math.random() * TRAIT_CATEGORIES.phil.length)],
      top: TRAIT_CATEGORIES.top[Math.floor(Math.random() * TRAIT_CATEGORIES.top.length)],
      nose: TRAIT_CATEGORIES.nose[Math.floor(Math.random() * TRAIT_CATEGORIES.nose.length)],
      teeth: TRAIT_CATEGORIES.teeth[Math.floor(Math.random() * TRAIT_CATEGORIES.teeth.length)],
      eyes: TRAIT_CATEGORIES.eyes[Math.floor(Math.random() * TRAIT_CATEGORIES.eyes.length)],
    }));
    setGeneratedNFTs((prev) => [...prev, ...newNFTs]);
  };

  const generateInitialNFTs = () => {
    setGeneratedNFTs([]);
    for (let i = 0; i < 5; i++) {
      generateNFTs();
    }
  };

  const generateUserNFTs = () => {
    if (!userTraitCategories) return;
    const newNFTs = Array.from({ length: 3 }, () => ({
      bg: userTraitCategories.bg[Math.floor(Math.random() * userTraitCategories.bg.length)],
      color: userTraitCategories.color[Math.floor(Math.random() * userTraitCategories.color.length)],
      wings: userTraitCategories.wings[Math.floor(Math.random() * userTraitCategories.wings.length)],
      spikes: userTraitCategories.spikes[Math.floor(Math.random() * userTraitCategories.spikes.length)],
      phil: userTraitCategories.phil[Math.floor(Math.random() * userTraitCategories.phil.length)],
      top: userTraitCategories.top[Math.floor(Math.random() * userTraitCategories.top.length)],
      nose: userTraitCategories.nose[Math.floor(Math.random() * userTraitCategories.nose.length)],
      teeth: userTraitCategories.teeth[Math.floor(Math.random() * userTraitCategories.teeth.length)],
      eyes: userTraitCategories.eyes[Math.floor(Math.random() * userTraitCategories.eyes.length)],
    }));
    setUserGeneratedNFTs((prev) => [...prev, ...newNFTs]);
  };

  const generateInitialUserNFTs = () => {
    setUserGeneratedNFTs([]);
    for (let i = 0; i < 5; i++) {
      generateUserNFTs();
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && (artistAddress || walletAddress)?.toLowerCase() === "0x22035d938b3fe388586F362c3BCF5471383A2AC9".toLowerCase()) {
          console.log("Generating more Phil NFTs...");
          generateNFTs();
        }
      },
      { threshold: 0.1 }
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [artistAddress, walletAddress]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && userTraitCategories && (artistAddress || walletAddress)?.toLowerCase() !== "0x22035d938b3fe388586F362c3BCF5471383A2AC9".toLowerCase()) {
          console.log("Generating more user NFTs...");
          generateUserNFTs();
        }
      },
      { threshold: 0.1 }
    );
    if (userObserverRef.current) observer.observe(userObserverRef.current);
    return () => observer.disconnect();
  }, [artistAddress, walletAddress, userTraitCategories]);

  const saveArtistName = () => {
    const trimmedName = tempArtistName.trim();
    if (trimmedName.length === 0) {
      alert("Artist name cannot be empty!");
    } else if (trimmedName.length > 16) {
      alert("Artist name must be 16 characters or fewer!");
    } else {
      setArtistName(trimmedName);
      setTempArtistName('');
    }
  };

  const saveProfile = async () => {
    if (!contract) {
      alert("Contract not initialized. Please reconnect wallet.");
      return;
    }
    try {
      const tx = await contract.saveProfile(artistName, xHandle, customHtml, profileTitle, artworkTitle);
      await tx.wait();
      alert("Profile saved to blockchain successfully!");
      await refreshProfileStatus();
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile: " + (error.message || "Unknown error"));
    }
  };

  const handleIconUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileIcon(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleArtworkUpload = (index, event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newArtwork = [...top4Artwork];
        newArtwork[index] = reader.result;
        setTop4Artwork(newArtwork);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTraitUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          setUserTraitCategories(data);
          generateInitialUserNFTs();
        } catch (error) {
          console.error("Error parsing trait JSON:", error);
          alert("Invalid JSON file. Please upload a valid traits.json.");
        }
      };
      reader.readAsText(file);
    } else {
      alert("Please upload a valid JSON file.");
    }
  };

  const handleImageError = (trait, url) => {
    console.error(`Failed to load trait: ${trait} at ${url}`);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-2xl mx-auto py-12 px-4 flex flex-col items-center">
        <div className="flex justify-between items-center mb-6 w-full">
          <h2 className="text-2xl font-bold text-art-black dark:text-highlight">
            {artistAddress && artistAddress.toLowerCase() !== walletAddress?.toLowerCase()
              ? `${artistName}'s Artist Canvas`
              : "Your Artist Canvas"}
          </h2>
          <Link
            to="/artist-dashboard"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>

        {!walletAddress && !artistAddress ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 w-full text-center">
            <h3 className="text-xl font-semibold text-art-black dark:text-highlight mb-4">
              Connect Your Wallet
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Connect your MetaMask wallet to verify your identity (Mordor Testnet required).
            </p>
          </div>
        ) : !hasProfile && !artistAddress && !artistName ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 w-full text-center">
            <h3 className="text-xl font-semibold text-art-black dark:text-highlight mb-4">
              Choose Your Artist Name
            </h3>
            <input
              type="text"
              value={tempArtistName}
              onChange={(e) => setTempArtistName(e.target.value.slice(0, 16))}
              placeholder="Enter your artist name (max 16 characters)"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-4 text-art-black dark:text-highlight bg-white dark:bg-gray-700"
            />
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {tempArtistName.length}/16 characters
            </p>
            <button
              onClick={saveArtistName}
              className="bg-highlight text-white px-6 py-2 rounded hover:bg-yellow-600 transition-colors duration-200"
            >
              Save
            </button>
          </div>
        ) : !hasProfile && !artistAddress ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 w-full flex flex-col items-center">
            <div className="w-full text-center">
              <div className="mb-4">
                {profileIcon ? (
                  <img
                    src={profileIcon}
                    alt="Profile"
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
                )}
                <h3 className="text-xl font-semibold text-art-black dark:text-highlight mb-2">
                  {artistName}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {xHandle || '@YourXHandle'}
                </p>
              </div>
              <div
                className="text-art-black dark:text-highlight mb-6"
                dangerouslySetInnerHTML={{ __html: customHtml }}
              />
            </div>
            <div className="w-full text-center">
              <h4 className="text-lg font-semibold text-art-black dark:text-highlight mb-3">
                Customize Your Profile
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-600 dark:text-gray-300 mb-1">Profile Icon</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleIconUpload}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-art-black dark:text-highlight bg-white dark:bg-gray-700 mx-auto"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-gray-300 mb-1">X Handle</label>
                  <input
                    type="text"
                    value={xHandle}
                    onChange={(e) => setXHandle(e.target.value)}
                    placeholder="@YourXHandle"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-art-black dark:text-highlight bg-white dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-gray-300 mb-1">Custom HTML</label>
                  <textarea
                    value={customHtml}
                    onChange={(e) => setCustomHtml(e.target.value)}
                    placeholder="Enter custom HTML"
                    className="w-full h-32 p-2 border border-gray-300 dark:border-gray-600 rounded text-art-black dark:text-highlight bg-white dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-gray-300 mb-1">Profile Section Title</label>
                  <input
                    type="text"
                    value={profileTitle}
                    onChange={(e) => setProfileTitle(e.target.value)}
                    placeholder="Enter profile section title"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-art-black dark:text-highlight bg-white dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-gray-300 mb-1">Artwork Section Title</label>
                  <input
                    type="text"
                    value={artworkTitle}
                    onChange={(e) => setArtworkTitle(e.target.value)}
                    placeholder="Enter artwork section title"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-art-black dark:text-highlight bg-white dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-gray-300 mb-1">Top 4 Artwork</label>
                  {[0, 1, 2, 3].map((i) => (
                    <input
                      key={i}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleArtworkUpload(i, e)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-art-black dark:text-highlight bg-white dark:bg-gray-700 mb-2"
                    />
                  ))}
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {top4Artwork.map((art, i) =>
                      art ? (
                        <img
                          key={i}
                          src={art}
                          alt={`Artwork ${i + 1}`}
                          className="w-32 h-32 object-cover rounded mx-auto"
                        />
                      ) : null
                    )}
                  </div>
                </div>
                <button
                  onClick={saveProfile}
                  className="bg-highlight text-white px-6 py-2 rounded hover:bg-yellow-600 transition-colors duration-200"
                >
                  Save Profile
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 w-full flex flex-col items-center">
            <div className="w-full text-center">
              <div className="mb-4">
                {profileIcon ? (
                  <img
                    src={profileIcon}
                    alt="Profile"
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
                )}
                <h3 className="text-xl font-semibold text-art-black dark:text-highlight mb-2">
                  {artistName}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {xHandle || '@YourXHandle'}
                </p>
              </div>
              <div
                className="text-art-black dark:text-highlight mb-6"
                dangerouslySetInnerHTML={{ __html: customHtml }}
              />
            </div>
            {(artistAddress || walletAddress)?.toLowerCase() === "0x22035d938b3fe388586F362c3BCF5471383A2AC9".toLowerCase() && (
              <div className="w-full text-center mb-6">
                <h4 className="text-lg font-semibold text-art-black dark:text-highlight mb-3">
                  Phil NFT Project
                </h4>
                <div className="space-y-4">
                  {Array.from({ length: Math.ceil(generatedNFTs.length / 3) }, (_, rowIndex) => (
                    <div key={rowIndex} className="flex justify-center space-x-4">
                      {generatedNFTs.slice(rowIndex * 3, (rowIndex + 1) * 3).map((nft, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <svg width="210" height="210" className="mb-2">
                            <image
                              href={`/traits/bg/${nft.bg}`}
                              width="210"
                              height="210"
                              loading="lazy"
                              onError={() => handleImageError('bg', `/traits/bg/${nft.bg}`)}
                            />
                            <image
                              href={`/traits/color/${nft.color}`}
                              width="210"
                              height="210"
                              loading="lazy"
                              onError={() => handleImageError('color', `/traits/color/${nft.color}`)}
                            />
                            <image
                              href={`/traits/wings/${nft.wings}`}
                              width="210"
                              height="210"
                              loading="lazy"
                              onError={() => handleImageError('wings', `/traits/wings/${nft.wings}`)}
                            />
                            <image
                              href={`/traits/spikes/${nft.spikes}`}
                              width="210"
                              height="210"
                              loading="lazy"
                              onError={() => handleImageError('spikes', `/traits/spikes/${nft.spikes}`)}
                            />
                            <image
                              href={`/traits/phil/${nft.phil}`}
                              width="210"
                              height="210"
                              loading="lazy"
                              onError={() => handleImageError('phil', `/traits/phil/${nft.phil}`)}
                            />
                            <image
                              href={`/traits/top/${nft.top}`}
                              width="210"
                              height="210"
                              loading="lazy"
                              onError={() => handleImageError('top', `/traits/top/${nft.top}`)}
                            />
                            <image
                              href={`/traits/nose/${nft.nose}`}
                              width="210"
                              height="210"
                              loading="lazy"
                              onError={() => handleImageError('nose', `/traits/nose/${nft.nose}`)}
                            />
                            <image
                              href={`/traits/teeth/${nft.teeth}`}
                              width="210"
                              height="210"
                              loading="lazy"
                              onError={() => handleImageError('teeth', `/traits/teeth/${nft.teeth}`)}
                            />
                            <image
                              href={`/traits/eyes/${nft.eyes}`}
                              width="210"
                              height="210"
                              loading="lazy"
                              onError={() => handleImageError('eyes', `/traits/eyes/${nft.eyes}`)}
                            />
                          </svg>
                          <button
                            className="bg-gray-200 dark:bg-gray-700 text-art-black dark:text-highlight px-4 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            disabled
                          >
                            Mint (Demo)
                          </button>
                        </div>
                      ))}
                    </div>
                  ))}
                  <div ref={observerRef} className="h-10"></div>
                  <button
                    onClick={generateNFTs}
                    className="mt-4 bg-highlight text-white px-6 py-2 rounded hover:bg-yellow-600 transition-colors"
                  >
                    Load More
                  </button>
                </div>
              </div>
            )}
            {userTraitCategories && (artistAddress || walletAddress)?.toLowerCase() !== "0x22035d938b3fe388586F362c3BCF5471383A2AC9".toLowerCase() && (
              <div className="w-full text-center mb-6">
                <h4 className="text-lg font-semibold text-art-black dark:text-highlight mb-3">
                  Your NFT Project
                </h4>
                <div className="space-y-4">
                  {Array.from({ length: Math.ceil(userGeneratedNFTs.length / 3) }, (_, rowIndex) => (
                    <div key={rowIndex} className="flex justify-center space-x-4">
                      {userGeneratedNFTs.slice(rowIndex * 3, (rowIndex + 1) * 3).map((nft, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <svg width="210" height="210" className="mb-2">
                            <image
                              href={`/traits/bg/${nft.bg}`}
                              width="210"
                              height="210"
                              loading="lazy"
                              onError={() => handleImageError('bg', `/traits/bg/${nft.bg}`)}
                            />
                            <image
                              href={`/traits/color/${nft.color}`}
                              width="210"
                              height="210"
                              loading="lazy"
                              onError={() => handleImageError('color', `/traits/color/${nft.color}`)}
                            />
                            <image
                              href={`/traits/wings/${nft.wings}`}
                              width="210"
                              height="210"
                              loading="lazy"
                              onError={() => handleImageError('wings', `/traits/wings/${nft.wings}`)}
                            />
                            <image
                              href={`/traits/spikes/${nft.spikes}`}
                              width="210"
                              height="210"
                              loading="lazy"
                              onError={() => handleImageError('spikes', `/traits/spikes/${nft.spikes}`)}
                            />
                            <image
                              href={`/traits/phil/${nft.phil}`}
                              width="210"
                              height="210"
                              loading="lazy"
                              onError={() => handleImageError('phil', `/traits/phil/${nft.phil}`)}
                            />
                            <image
                              href={`/traits/top/${nft.top}`}
                              width="210"
                              height="210"
                              loading="lazy"
                              onError={() => handleImageError('top', `/traits/top/${nft.top}`)}
                            />
                            <image
                              href={`/traits/nose/${nft.nose}`}
                              width="210"
                              height="210"
                              loading="lazy"
                              onError={() => handleImageError('nose', `/traits/nose/${nft.nose}`)}
                            />
                            <image
                              href={`/traits/teeth/${nft.teeth}`}
                              width="210"
                              height="210"
                              loading="lazy"
                              onError={() => handleImageError('teeth', `/traits/teeth/${nft.teeth}`)}
                            />
                            <image
                              href={`/traits/eyes/${nft.eyes}`}
                              width="210"
                              height="210"
                              loading="lazy"
                              onError={() => handleImageError('eyes', `/traits/eyes/${nft.eyes}`)}
                            />
                          </svg>
                          <button
                            className="bg-gray-200 dark:bg-gray-700 text-art-black dark:text-highlight px-4 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            disabled
                          >
                            Mint (Demo)
                          </button>
                        </div>
                      ))}
                    </div>
                  ))}
                  <div ref={userObserverRef} className="h-10"></div>
                  <button
                    onClick={generateUserNFTs}
                    className="mt-4 bg-highlight text-white px-6 py-2 rounded hover:bg-yellow-600 transition-colors"
                  >
                    Load More
                  </button>
                </div>
              </div>
            )}
            <div className="w-full text-center">
              <h4 className="text-lg font-semibold text-art-black dark:text-highlight mb-3">
                {profileTitle}
              </h4>
              <div className="mb-6">
                <label className="block text-gray-600 dark:text-gray-300 mb-1">{artworkTitle}</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {top4Artwork.map((art, i) =>
                    art ? (
                      <img
                        key={i}
                        src={art}
                        alt={`Artwork ${i + 1}`}
                        className="w-32 h-32 object-cover rounded mx-auto"
                      />
                    ) : null
                  )}
                </div>
              </div>
              {!artistAddress && (
                <div className="w-full">
                  <h4 className="text-lg font-semibold text-art-black dark:text-highlight mb-3">
                    Minting Playground
                  </h4>
                  <div className="flex justify-center space-x-4 mb-4">
                    <button
                      onClick={() => setActiveTab('layerzero')}
                      className={`px-4 py-2 rounded ${activeTab === 'layerzero' ? 'bg-highlight text-white' : 'bg-gray-200 dark:bg-gray-700 text-art-black dark:text-highlight'} hover:bg-yellow-600 hover:text-white transition-colors`}
                    >
                      LayerZero Contract
                    </button>
                    <button
                      onClick={() => setActiveTab('upload')}
                      className={`px-4 py-2 rounded ${activeTab === 'upload' ? 'bg-highlight text-white' : 'bg-gray-200 dark:bg-gray-700 text-art-black dark:text-highlight'} hover:bg-yellow-600 hover:text-white transition-colors`}
                    >
                      Upload Mint Files
                    </button>
                    <button
                      onClick={() => setActiveTab('feed')}
                      className={`px-4 py-2 rounded ${activeTab === 'feed' ? 'bg-highlight text-white' : 'bg-gray-200 dark:bg-gray-700 text-art-black dark:text-highlight'} hover:bg-yellow-600 hover:text-white transition-colors`}
                    >
                      Artist Feed
                    </button>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded w-full text-left">
                    {activeTab === 'layerzero' ? (
                      <div>
                        <h5 className="text-md font-semibold text-art-black dark:text-highlight mb-2">
                          LayerZero Contract Preview
                        </h5>
                        <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {`// Muse Artist NFT Contract with LayerZero
pragma solidity ^0.8.0;

contract MuseNFT {
    uint256 public constant MAX_SUPPLY = 369;
    uint256 public totalSupply = 0;
    uint256 public constant ROYALTY_PERCENT = 5; // 5% royalty
    uint256 public constant HOLDING_PERIOD = 30 days;
    
    mapping(uint256 => address) public ownerOf;
    mapping(uint256 => uint256) public lastTransferTime;
    
    address public artist;
    address public layerZeroEndpoint;

    event Minted(address indexed to, uint256 tokenId);
    event Transferred(address indexed from, address indexed to, uint256 tokenId);

    constructor(address _layerZeroEndpoint) {
        artist = msg.sender;
        layerZeroEndpoint = _layerZeroEndpoint;
    }

    function mint(address to) public {
        require(totalSupply < MAX_SUPPLY, "Max supply reached");
        uint256 tokenId = totalSupply;
        totalSupply++;
        ownerOf[tokenId] = to;
        lastTransferTime[tokenId] = block.timestamp;
        emit Minted(to, tokenId);
    }

    function transfer(address to, uint256 tokenId) public {
        require(msg.sender == ownerOf[tokenId], "Not owner");
        require(block.timestamp >= lastTransferTime[tokenId] + HOLDING_PERIOD, "Holding period active");
        uint256 royalty = (msg.value * ROYALTY_PERCENT) / 100;
        payable(artist).transfer(royalty);
        ownerOf[tokenId] = to;
        lastTransferTime[tokenId] = block.timestamp;
        emit Transferred(msg.sender, to, tokenId);
    }

    // LayerZero cross-chain minting (mock)
    function sendMint(address to, bytes memory data) public {
        // Call LayerZero endpoint to send cross-chain message
        // ILayerZeroEndpoint(layerZeroEndpoint).send{value: msg.value}(to, data);
    }
}`}
                        </pre>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          A platform for artists where they set their own royalties, at least a 30-day holding period, and a 369 NFT limit per project.
                        </p>
                      </div>
                    ) : activeTab === 'upload' ? (
                      <div>
                        <h5 className="text-md font-semibold text-art-black dark:text-highlight mb-2">
                          Upload Mint Files
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Upload a JSON file (e.g., traits.json) to create your own NFT project structure.
                        </p>
                        <input
                          type="file"
                          accept="application/json"
                          onChange={handleTraitUpload}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-art-black dark:text-highlight bg-white dark:bg-gray-700"
                        />
                      </div>
                    ) : (
                      <div>
                        <h5 className="text-md font-semibold text-art-black dark:text-highlight mb-2">
                          Artist Feed
                        </h5>
                        <div className="space-y-4">
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                            <div className="flex items-center mb-2">
                              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full mr-2"></div>
                              <div>
                                <p className="text-sm font-semibold text-art-black dark:text-highlight">
                                  @Ling
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  2h ago
                                </p>
                              </div>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">
                              Phil -- soon...maybe
                            </p>
                            <img
                              src="http://localhost:8000/images/art1.png"
                              alt="Post"
                              className="w-full h-32 object-cover rounded mt-2"
                            />
                            <div className="flex justify-between mt-2 text-sm text-gray-500 dark:text-gray-400">
                              <span>10 Likes</span>
                              <span>3 Comments</span>
                            </div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                            <div className="flex items-center mb-2">
                              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full mr-2"></div>
                              <div>
                                <p className="text-sm font-semibold text-art-black dark:text-highlight">
                                  @Ling
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  5h ago
                                </p>
                              </div>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">
                              for Phil's body and teeth trait, we're using the voronoi pattern which has become one of my favorites.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistCanvas;
