// export const ETH_CHAIN_ID = 1 // REAL VALUE
export const ETH_CHAIN_ID = 4 // TEST VALUE
export const BSC_CHAIN_ID = 56

export const BSC_ETH_BRIDGE_ADDRESS = '0xE83eA178D7FE5a7dfFD597d5e887d99d279Aa030'

// export const CAPS_TOKEN_ADDRESS_ETH = '0x03be5c903c727ee2c8c4e9bc0acc860cca4715e2' // REAL VALUE
export const CAPS_TOKEN_ADDRESS_ETH = '0xcE9D9Db4264a50aEF8B5627E882Ed71dF66d2105' // TEST VALUE
export const CAPS_TOKEN_ADDRESS_BSC = '0xffba7529ac181c2ee1844548e6d7061c9a597df4'

// export const PROVIDER_BASE_URL_ETH = `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}` // REAL VALUE
export const PROVIDER_BASE_URL_ETH = `https://rinkeby.infura.io/v3/${process.env.NEXT_PUBLIC_RINKEBY_ID}` // TEST VALUE
export const PROVIDER_BASE_URL_BSC = 'https://bsc-dataseed.binance.org/'

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
]
