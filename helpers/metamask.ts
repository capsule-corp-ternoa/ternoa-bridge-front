import { ethers } from 'ethers'
import { AnyAction } from 'redux'

import { actions } from '../redux/user/actions'
import { ETH_CHAIN_ID, getErcWalletFromSigner } from './erc'

declare global {
  interface Window {
    ethereum: any
  }
}

let isListening = false

export const checkExtension = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask provider not available')
  }
}

export const connect = async (dispatch: (action: AnyAction) => void) => {
  await checkExtension()
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
  if (accounts && accounts?.length > 0) {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner(accounts[0])
    const ercWallet = await getErcWalletFromSigner(signer, 'metamask')

    if (!isListening) {
      isListening = true
      window.ethereum.on('chainChanged', async () => {
        await connect(dispatch)
      })
      window.ethereum.on('accountsChanged', async (accounts: any) => {
        if (accounts && accounts.length > 0) {
          await connect(dispatch)
        } else {
          dispatch(actions.logoutErc())
        }
      })
    }

    dispatch(actions.loginErc(ercWallet))
  } else {
    throw new Error('No MetaMask account retrieved')
  }
}

export const switchBSCNetwork = async () => {
  checkExtension()
  await window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [
      {
        chainId: '0x38', //56 in decimal
        chainName: 'Binance Smart Chain',
        rpcUrls: ['https://bsc-dataseed.binance.org/'],
        nativeCurrency: {
          name: 'BNB',
          symbol: 'BNB',
          decimals: 18,
        },
        blockExplorerUrls: ['https://bscscan.com'],
      },
    ],
  })
}

export const switchETHNetwork = async () => {
  checkExtension()
  await window.ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [
      {
        chainId: `0x${ETH_CHAIN_ID}`,
      },
    ],
  })
}
