import { AnyAction } from 'redux'
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types'
import { ChainType, User } from '../interfaces'
import { connect as connectMetamask, switchBSCNetwork, switchETHNetwork } from './metamask'
import { connect as connectWalletConnect } from './walletconnect'
import {
  connect as connectPolkadot,
  reconnect as reconnectPolkadot,
  getTransferFees as getTransferFeesPolkadot,
  transfer as transferTernoaEth,
} from './polkadot'
import {
  BSC_CHAIN_ID,
  ETH_CHAIN_ID,
  reconnect as reconnectErc,
  isApproved as isApprovedErc,
  getTransferBscEthFees,
  getTransferEthTernoaFees,
  transferBscEth,
  transferEthTernoa,
  approve as approveEthCaps,
} from './erc'

const minAmount = 200
const maxAmount = 100000

const isConnected = (from: ChainType, user: User) => {
  switch (from) {
    case 'ternoa':
      return user.isConnectedPolkadot
    case 'erc20':
      return user.isConnectedErc && user.ercWallet?.chainId === ETH_CHAIN_ID
    case 'bep20':
      return user.isConnectedErc && user.ercWallet?.chainId === BSC_CHAIN_ID
    default:
      return false
  }
}

export const connect = (
  chainType: ChainType,
  dispatch: (action: AnyAction) => void,
  connectedWith?: string,
  selectedPolkadotAccount?: InjectedAccountWithMeta
) => {
  switch (chainType) {
    case 'erc20' || 'bep20':
      if (!connectedWith) throw new Error('No provider found')
      if (connectedWith === 'metamask') {
        connectMetamask(dispatch)
        if (chainType === 'erc20') {
          switchETHNetwork()
        } else {
          switchBSCNetwork()
        }
      } else {
        connectWalletConnect(dispatch)
      }
      break
    case 'ternoa':
      if (!selectedPolkadotAccount) throw new Error('No polkadot account selected')
      connectPolkadot(selectedPolkadotAccount, dispatch)
      break
    default: {
      throw new Error('Chaintype not recognized')
    }
  }
}

export const reconnect = (dispatch: (action: AnyAction) => void) => {
  reconnectErc(dispatch)
  reconnectPolkadot(dispatch)
}

export const getBalance = (from: ChainType, user: User) => {
  return from === 'ternoa' ? user.polkadotWallet?.capsBalance : user.ercWallet?.capsBalance
}

export const canProceed = (from: ChainType, to: ChainType, amount: number, user: User): boolean => {
  try {
    const key = `${from}-${to}`
    const validDirections = ['erc20-bep20', 'bep20-erc20', 'erc20-ternoa', 'ternoa-erc20']
    if (!validDirections.includes(key)) throw new Error('Invalid combination')
    if (!isConnected(from, user)) throw new Error('From network is not connected')
    if (!isConnected(to, user)) throw new Error('To network is not connected')
    if (amount < minAmount) throw new Error('amount is below minimum amount to swap')
    if (amount > maxAmount) throw new Error('amount is above maximum amount to swap')
    const balance = getBalance(from, user)
    if (!balance || balance < amount) throw new Error('Insufficient balance')
    return true
  } catch (err) {
    console.error(err)
    return false
  }
}

export const isApproved = (from: ChainType, to: ChainType, user: User) => {
  if (from === 'erc20' && to === 'ternoa') {
    const signer = user.ercWallet?.signer
    if (!signer) throw new Error('Signer not found')
    return isApprovedErc(signer)
  } else {
    return true
  }
}

export const approve = async (from: ChainType, to: ChainType, user: User) => {
  if (from === 'erc20' && to === 'ternoa') {
    const signer = user.ercWallet?.signer
    if (!signer) throw new Error('Signer not found')
    return await approveEthCaps(signer)
  } else {
    throw new Error('Nothing to approve')
  }
}

export const getAddressFromChainType = (chainType: ChainType, user: User): string => {
  switch (chainType) {
    case 'ternoa':
      if (!user.polkadotWallet) throw new Error('No address found for polkadot wallet')
      return user.polkadotWallet.address
    case 'erc20' || 'bep20':
      if (!user.ercWallet) throw new Error('No address found for erc wallet')
      return user.ercWallet.address
    default:
      throw new Error('Chaintype not recognized')
  }
}

export const getNetworkFees = async (
  from: ChainType,
  to: ChainType,
  amount: number,
  user: User
): Promise<{ value: string; unit: string }> => {
  switch (from) {
    case 'ternoa':
      if (!user.polkadotWallet) throw new Error('Polkadot wallet not connected')
      return { value: await getTransferFeesPolkadot(user.polkadotWallet, amount), unit: 'CAPS' }
    case 'bep20':
      if (!user.ercWallet) throw new Error('Erc wallet not connected')
      return { value: await getTransferBscEthFees(user.ercWallet.signer, amount), unit: 'BNB' }
    case 'erc20':
      if (!user.ercWallet) throw new Error('Erc wallet not connected')
      if (to === 'bep20') return { value: await getTransferBscEthFees(user.ercWallet.signer, amount), unit: 'ETH' }
      if (to === 'ternoa') return { value: await getTransferEthTernoaFees(user.ercWallet.signer, amount), unit: 'ETH' }
      throw new Error('Invalid combination')
    default:
      throw new Error('Chaintype not recognized')
  }
}

export const transfer = async (
  from: ChainType,
  to: ChainType,
  amount: number,
  user: User,
  setResponse: (response: { message: string; txLink: string; isError: boolean }) => void
) => {
  switch (from) {
    case 'ternoa':
      if (!user.polkadotWallet) throw new Error('Signer not found')
      await transferTernoaEth(user.polkadotWallet, amount, setResponse)
      break
    case 'bep20':
      if (!user.ercWallet) throw new Error('Signer not found')
      const tx = await transferBscEth(user.ercWallet?.signer, amount)
      const receipt = await tx.wait()
      setResponse({
        message: 'Please check your wallet balance',
        txLink: `https://bscscan.com/tx/${receipt.transactionHash}`,
        isError: false,
      })
      break
    case 'erc20':
      if (to !== 'bep20' && to !== 'ternoa') throw new Error('Invalid combination')
      if (to === 'bep20') {
        if (!user.ercWallet) throw new Error('Signer not found')
        const tx = await transferBscEth(user.ercWallet?.signer, amount)
        const receipt = await tx.wait()
        setResponse({
          message: 'Please check your wallet balance',
          txLink: `https://etherscan.io/tx/${receipt.transactionHash}`,
          isError: false,
        })
      }
      if (to === 'ternoa') {
        if (!user.ercWallet) throw new Error('Signer not found')
        const tx: any = await transferEthTernoa(user.ercWallet?.signer, amount)
        const receipt = await tx.wait()
        setResponse({
          message: 'Your balance will be availble in few moment (it can take up to 1 day)',
          txLink: `https://etherscan.io/tx/${receipt.transactionHash}`,
          isError: false,
        })
      }
      break
    default:
      throw new Error('Chaintype not recognized')
  }
}
