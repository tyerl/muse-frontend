// src/context/WalletContext.js
import React, { createContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

export const WalletContext = createContext();

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

export const WalletProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      setConnectionError("Please install MetaMask to connect your wallet!");
      return;
    }

    if (isConnecting) return;
    setIsConnecting(true);
    setConnectionError(null);

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x3f' }],
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);

      const network = await provider.getNetwork();
      if (network.chainId !== 63n) {
        throw new Error("Connected to wrong network. Please ensure you’re on Mordor Testnet (Chain ID 63).");
      }

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const [, , , , , exists] = await contract.getProfile(address);
      setHasProfile(exists);
    } catch (error) {
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x3f',
              chainName: 'Mordor Testnet',
              rpcUrls: ['https://rpc.testnet.mordor.etccooperative.org'],
              nativeCurrency: {
                name: 'Mordor ETC',
                symbol: 'METC',
                decimals: 18,
              },
              blockExplorerUrls: ['https://explorer.testnet.mordor.etccooperative.org'],
            }],
          });
          await connectWallet();
        } catch (addError) {
          setConnectionError("Failed to add Mordor Testnet: " + addError.message);
        }
      } else if (error.code === -32002) {
        setConnectionError("Please unlock MetaMask or complete the pending connection request.");
      } else {
        setConnectionError(error.message || "Failed to connect wallet. Please try again.");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // Expose a method to refresh profile status
  const refreshProfileStatus = async () => {
    if (walletAddress && window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const [, , , , , exists] = await contract.getProfile(walletAddress);
      setHasProfile(exists);
    }
  };

  return (
    <WalletContext.Provider value={{ walletAddress, hasProfile, isConnecting, connectionError, connectWallet, refreshProfileStatus }}>
      {children}
    </WalletContext.Provider>
  );
};
