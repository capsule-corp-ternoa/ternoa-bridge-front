import { ethers } from 'ethers'
import { AnyAction } from 'redux'
import WalletConnectProvider from '@walletconnect/web3-provider'

import { actions } from '../redux/user/actions'
import { getErcWalletFromSigner, PROVIDER_BASE_URL_BSC, PROVIDER_BASE_URL_ETH } from './erc'

const WALLETCONNECT_BRIDGE = 'https://uniswap.bridge.walletconnect.org'

export let walletConnectProvider: WalletConnectProvider
let isListening = false

const initWalletConnectProvider = async () => {
  if (!walletConnectProvider || !walletConnectProvider.connected) {
    walletConnectProvider = new WalletConnectProvider({
      rpc: {
        1: PROVIDER_BASE_URL_ETH,
        56: PROVIDER_BASE_URL_BSC,
      },
      infuraId: process.env.NEXT_PUBLIC_INFURA_ID,
      bridge: WALLETCONNECT_BRIDGE,
    })
    try {
      await walletConnectProvider.enable()
    } catch (err: any) {
      if (err.message && err.message === 'User closed modal') console.log(err.message)
      else throw err
    }
  }
}

export const connect = async (dispatch: (action: AnyAction) => void) => {
  await initWalletConnectProvider()
  const accounts = walletConnectProvider.accounts
  if (accounts && accounts.length > 0) {
    const provider = new ethers.providers.Web3Provider(walletConnectProvider)
    const signer = provider.getSigner(accounts[0])
    const ercWallet = await getErcWalletFromSigner(signer, 'walletconnect')

    if (!isListening) {
      isListening = true
      walletConnectProvider.on('accountsChanged', async (accounts: string[]) => {
        if (accounts && accounts.length > 0) {
          await connect(dispatch)
        } else {
          dispatch(actions.logoutErc())
        }
      })
      walletConnectProvider.on('chainChanged', async () => {
        await connect(dispatch)
      })
      walletConnectProvider.on('disconnect', async () => {
        isListening = false
        dispatch(actions.logoutErc(false))
      })
    }

    dispatch(actions.loginErc(ercWallet))
  } else {
    throw new Error('No WalletConnect account retrieved')
  }
}
