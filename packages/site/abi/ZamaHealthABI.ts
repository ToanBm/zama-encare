
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const ZamaHealthABI = {
  "abi": [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_usdc",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "oldOracle",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOracle",
          "type": "address"
        }
      ],
      "name": "BackendOracleUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "FeesWithdrawn",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "sessionId",
          "type": "uint256"
        }
      ],
      "name": "SessionCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "sessionId",
          "type": "uint256"
        }
      ],
      "name": "SessionInputSubmitted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "sessionId",
          "type": "uint256"
        }
      ],
      "name": "SessionResultSubmitted",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "VISIT_FEE",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "backendOracle",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "contractBalance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "createSession",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "sessionId",
          "type": "uint256"
        }
      ],
      "name": "getEncryptedInputs",
      "outputs": [
        {
          "internalType": "euint64",
          "name": "",
          "type": "bytes32"
        },
        {
          "internalType": "euint64",
          "name": "",
          "type": "bytes32"
        },
        {
          "internalType": "euint8",
          "name": "",
          "type": "bytes32"
        },
        {
          "internalType": "euint8",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "sessionId",
          "type": "uint256"
        }
      ],
      "name": "getEncryptedResult",
      "outputs": [
        {
          "internalType": "euint64",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "nextSessionId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "protocolId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "sessions",
      "outputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "exists",
          "type": "bool"
        },
        {
          "internalType": "euint64",
          "name": "weight",
          "type": "bytes32"
        },
        {
          "internalType": "euint64",
          "name": "height",
          "type": "bytes32"
        },
        {
          "internalType": "euint8",
          "name": "exercise",
          "type": "bytes32"
        },
        {
          "internalType": "euint8",
          "name": "diet",
          "type": "bytes32"
        },
        {
          "internalType": "euint64",
          "name": "result",
          "type": "bytes32"
        },
        {
          "internalType": "bool",
          "name": "resultReady",
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
          "name": "_backend",
          "type": "address"
        }
      ],
      "name": "setBackendOracle",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "sessionId",
          "type": "uint256"
        },
        {
          "internalType": "externalEuint64",
          "name": "extWeight",
          "type": "bytes32"
        },
        {
          "internalType": "externalEuint64",
          "name": "extHeight",
          "type": "bytes32"
        },
        {
          "internalType": "externalEuint8",
          "name": "extExercise",
          "type": "bytes32"
        },
        {
          "internalType": "externalEuint8",
          "name": "extDiet",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "att",
          "type": "bytes"
        }
      ],
      "name": "submitEncryptedInput",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "sessionId",
          "type": "uint256"
        },
        {
          "internalType": "externalEuint64",
          "name": "extResult",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "att",
          "type": "bytes"
        }
      ],
      "name": "submitEncryptedResult",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "usdc",
      "outputs": [
        {
          "internalType": "contract IERC20",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        }
      ],
      "name": "withdrawFees",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
} as const;

