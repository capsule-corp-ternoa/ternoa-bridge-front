import { AnyAction } from 'redux'
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types'

import { ChainType, ResponseNominalSetState, RESPONSE_DEFAULT_STATE, TransactionLifeCycleStatus, User } from 'interfaces'
import { formatPrice } from 'utils/strings'

import { connect as connectMetamask, switchBSCNetwork, switchETHNetwork } from './metamask'
import { connect as connectWalletConnect } from './walletconnect'
import {
  connect as connectPolkadot,
  reconnect as reconnectPolkadot,
  getTransferFees as getTransferFeesPolkadot,
  getBridgeFees,
  transfer as transferTernoaEth,
  waitForResponseEthTernoa,
} from './polkadot'
import {
  BSC_CHAIN_ID,
  ETH_CHAIN_ID,
  reconnect as reconnectErc,
  isApproved as isApprovedErc,
  getBalance as getErcBalance,
  getTransferBscEthFees,
  getTransferEthTernoaFees,
  transferBscEth,
  transferEthTernoa,
  approve as approveEthCaps,
  waitForResponseTernoaEth,
} from './erc'

export const MIN_AMOUNT = 20 //0 TODO
export const MAX_AMOUNT = 100000
export const SLEEP_INTERVAL = 10000
export const RELAYER_THRESHOLD = 2
export const BLOCK_LIMIT = 100

export const isConnected = (from: ChainType, user: User) => {
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

export const connect = async (
  chainType: ChainType,
  dispatch: (action: AnyAction) => void,
  connectedWith?: 'metamask' | 'walletConnect',
  selectedPolkadotAccount?: InjectedAccountWithMeta,
  isNetworkSwitchAllowed = true
) => {
  switch (chainType) {
    case 'erc20':
    case 'bep20':
      if (!connectedWith) throw new Error('No provider found')
      if (connectedWith === 'metamask') {
        try {
          await connectMetamask(dispatch)
          if (isNetworkSwitchAllowed) {
            if (chainType === 'erc20') {
              await switchETHNetwork()
            } else {
              await switchBSCNetwork()
            }
          }
        } catch (error) {
          console.error(error)
        }
      } else {
        try {
          connectWalletConnect(dispatch)
        } catch (error) {
          console.error(error)
        }
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

export const getAddress = (from: ChainType, user: User) => {
  return from === 'ternoa' ? user.polkadotWallet?.address : user.ercWallet?.address
}

export const getBalance = (from: ChainType, user: User) => {
  return from === 'ternoa' ? user.polkadotWallet?.capsBalance : user.ercWallet?.capsBalance
}

export const checkProceed = async (from: ChainType, to: ChainType, amount: number, user: User) => {
  const key = `${from}-${to}`
  const validDirections = ['erc20-bep20', 'bep20-erc20', 'erc20-ternoa', 'ternoa-erc20']
  const bridgeFee = `${from}-${to}` === 'ternoa-erc20' ? await getBridgeFees() : 0
  if (!validDirections.includes(key))
    throw new Error('Invalid combination', {
      cause: new Error('Incorrect network'),
    })
  if (!isConnected(from, user))
    throw new Error('From network is not connected', {
      cause: new Error('Incorrect network'),
    })
  if (!(key === 'erc20-bep20' || key === 'bep20-erc20')) {
    if (!isConnected(to, user))
      throw new Error('To network is not connected', {
        cause: new Error('Incorrect network'),
      })
  }
  if (amount < MIN_AMOUNT)
    throw new Error(`Amount must be greater than ${MIN_AMOUNT} CAPS`, {
      cause: new Error('Incorrect amount'),
    })
  if (amount > MAX_AMOUNT)
    throw new Error(`Amount must be less than ${MAX_AMOUNT} CAPS`, {
      cause: new Error('Incorrect amount'),
    })
  const balance = getBalance(from, user)
  if (!balance || balance < amount)
    throw new Error('Insufficient balance', {
      cause: new Error('Incorrect amount'),
    })
  if (key === 'ternoa-erc20' && balance < amount + bridgeFee)
    throw new Error(`Insufficient funds to pay ${formatPrice(bridgeFee, {})} CAPS of bridge fee`, {
      cause: new Error('Incorrect amount'),
    })
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

export const getNetworkFees = async (from: ChainType, to: ChainType, amount: number, user: User): Promise<{ value: string; unit: string }> => {
  switch (from) {
    case 'ternoa':
      if (!user.polkadotWallet) throw new Error('Polkadot wallet not connected')
      return { value: await getTransferFeesPolkadot(user, amount), unit: 'CAPS' }
    case 'bep20':
      if (!user.ercWallet) throw new Error('Erc wallet not connected')
      return { value: await getTransferBscEthFees(user.ercWallet.signer, amount), unit: 'BNB' }
    case 'erc20':
      if (!user.ercWallet) throw new Error('Erc wallet not connected')
      if (to === 'bep20') return { value: await getTransferBscEthFees(user.ercWallet.signer, amount), unit: 'ETH' }
      if (to === 'ternoa') return { value: await getTransferEthTernoaFees(user, amount), unit: 'ETH' }
      throw new Error('Invalid combination')
    default:
      throw new Error('Chaintype not recognized')
  }
}

export const transfer = async (from: ChainType, to: ChainType, amount: number, user: User, setResponse: ResponseNominalSetState) => {
  try {
    const explorerPrefix = ETH_CHAIN_ID === 1 ? '' : ETH_CHAIN_ID === 5 ? 'goerli.' : 'rinkeby.'
    switch (from) {
      case 'ternoa':
        if (!user.polkadotWallet) throw new Error('Signer not found')
        await transferTernoaEth(user, amount, setResponse)
        await waitForResponseTernoaEth(user, amount, setResponse)
        break
      case 'bep20':
        if (!user.ercWallet) throw new Error('Signer not found')
        const tx = await transferBscEth(user.ercWallet?.signer, amount)
        setResponse({
          ...RESPONSE_DEFAULT_STATE,
          isTxSubmitted: true,
        })
        const receipt = await tx.wait()
        const newBalance = await getErcBalance(user.ercWallet.signer)
        setResponse((prevState) => ({
          ...prevState,
          newBalance,
          status: TransactionLifeCycleStatus.TX_SUCCESS,
          tx: {
            hash: receipt.transactionHash,
            link: `https://bscscan.com/tx/${receipt.transactionHash}`,
          },
        }))
        break
      case 'erc20':
        if (to !== 'bep20' && to !== 'ternoa') throw new Error('Invalid combination')
        if (to === 'bep20') {
          if (!user.ercWallet) throw new Error('Signer not found')
          const tx = await transferBscEth(user.ercWallet?.signer, amount)
          setResponse({
            ...RESPONSE_DEFAULT_STATE,
            isTxSubmitted: true,
          })
          const receipt = await tx.wait()
          const newBalance = await getErcBalance(user.ercWallet.signer)
          setResponse((prevState) => ({
            ...prevState,
            newBalance,
            status: TransactionLifeCycleStatus.TX_SUCCESS,
            tx: {
              hash: receipt.transactionHash,
              link: `https://${explorerPrefix}etherscan.io/tx/${receipt.transactionHash}`,
            },
          }))
        }
        if (to === 'ternoa') {
          if (!user.ercWallet) throw new Error('Signer not found')
          const tx: any = await transferEthTernoa(user, amount)
          setResponse({
            ...RESPONSE_DEFAULT_STATE,
            isTxSubmitted: true,
            voteTxs: [],
          })
          const receipt = await tx.wait()
          const newBalance = await getErcBalance(user.ercWallet.signer)
          setResponse((prevState) => ({
            ...prevState,
            newBalance,
            tx: {
              hash: receipt.transactionHash,
              link: `https://${explorerPrefix}etherscan.io/tx/${receipt.transactionHash}`,
            },
          }))
          await waitForResponseEthTernoa(user, amount, setResponse)
        }
        break
      default:
        throw new Error('Chaintype not recognized')
    }
  } catch (err: any) {
    const errorMessage = typeof err === 'string' ? err : typeof err !== 'object' ? 'Unknown error' : err.message ? err.message : JSON.stringify(err)
    setResponse((prevState) => ({
      ...prevState,
      body: errorMessage,
      status: TransactionLifeCycleStatus.TX_FAILED,
    }))
  }
}
