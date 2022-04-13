export const CAPS_CONTRACT_ABI = [
  {
    constant: true,
    inputs: [
      {
        internalType: 'address',
        name: 'tokenOwner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: 'balance',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    name: 'transfer',
    type: 'function',
    inputs: [
      {
        name: '_to',
        type: 'address',
      },
      {
        type: 'uint256',
        name: '_tokens',
      },
    ],
    constant: false,
    outputs: [],
    payable: false,
  },
  {
    constant: true,
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: 'allowance', type: 'uint256' }],
    stateMutability: 'view',
    payable: false,
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

export const BRIDGE_CONTRACT_ABI = [
  {
    inputs: [
      { internalType: 'uint8', name: 'destinationChainID', type: 'uint8' },
      { internalType: 'bytes32', name: 'resourceID', type: 'bytes32' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
    ],
    name: 'deposit',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
]
