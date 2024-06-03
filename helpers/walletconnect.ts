import { ethers } from 'ethers'
import { AnyAction } from 'redux'
import { EthereumProvider } from '@walletconnect/ethereum-provider'

import { actions } from '../redux/user/actions'
import { getErcWalletFromSigner } from './erc'

export let walletConnectProvider: any
let isListening = false

const initWalletConnectProvider = async () => {
  if (!walletConnectProvider || !walletConnectProvider.connected) {
    walletConnectProvider = await EthereumProvider.init({
      projectId: '724d1c325bdb47b621fddf7d420c5e16', // project id from https://cloud.walletconnect.com/
      optionalChains: [11155111, 97], // required, 11155111 sepolia , 97 bsc-testnet
      showQrModal: true, // requires @walletconnect/modal
    })

    await walletConnectProvider.enable()
  }
}

export const connect = async (dispatch: (action: AnyAction) => void) => {
  try {
    await initWalletConnectProvider()
    const accounts = walletConnectProvider.accounts
    // console.log('accounts', accounts)
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
  } catch (err: any) {
    if (err.message && err.message === 'User closed modal') console.log(err.message)
    else throw err
  }
}
