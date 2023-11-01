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
      projectId: '7ad487a4ee34c967ea617be202715c74', // project id from https://cloud.walletconnect.com/
      chains: [1, 56], // required, 1 eth , 56 bsc
      showQrModal: true, // requires @walletconnect/modal
    })

    await walletConnectProvider.enable()
  }
}

export const connect = async (dispatch: (action: AnyAction) => void) => {
  try {
    await initWalletConnectProvider()
    const accounts = walletConnectProvider.accounts
    console.log('accounts', accounts)
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
          console.log('chainChanged')
          await connect(dispatch)
        })
        walletConnectProvider.on('disconnect', async () => {
          isListening = false
          console.log('disconnected')
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
