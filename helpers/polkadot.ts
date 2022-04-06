import { cryptoWaitReady } from '@polkadot/util-crypto'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types'
import { decodeAddress } from '@polkadot/util-crypto'
import { u8aToHex } from '@polkadot/util'
import { AnyAction } from 'redux'
import { actions } from '../redux/user/actions'
import BN from 'bn.js'
import { User } from '../interfaces'
import { clear, get, USER_POLKADOT_ADDRESS } from './storage'
import { NUMBER_OF_DECIMALS } from './erc'

let api: ApiPromise

const CHAIN_ENDPOINT = process.env.NEXT_PUBLIC_TERNOA_WSS_CHAIN_ENDPOINT || 'wss://dev.chaos.ternoa.com'
const ETH_DEST_ID = 0
const BRIDGE_FEES = 50

const initializeApi = async () => {
  await cryptoWaitReady()
  const wsProvider = new WsProvider(CHAIN_ENDPOINT)
  api = await ApiPromise.create({
    provider: wsProvider,
    types: {},
  })
  return api
}

const getApi = async () => {
  if (!api || !api.isConnected) api = await initializeApi()
  return api
}

export const safeDisconnect = async () => {
  if (api && api.isConnected) await api.disconnect()
}

export const formatBalance = (balance: string, decimals = 3) => {
  return Number(balance.slice(0, -(NUMBER_OF_DECIMALS - decimals))) / Math.pow(10, decimals)
}

export const formatInput = (input: number) => {
  const bnBase = new BN('1000000000000000000')
  const bnAmount = new BN(input)
  return bnAmount.mul(bnBase)
}

export const getBalance = async (address: string) => {
  const api = await getApi()
  const balance: { free: BN } = ((await api.query.system.account(address)) as any).data
  return formatBalance(balance.free.toString())
}

export const reconnect = async (dispatch: (action: AnyAction) => void) => {
  try {
    const polkadotAddress = get(USER_POLKADOT_ADDRESS)
    if (polkadotAddress) {
      const accounts = await getAccounts()
      const account = accounts.find((x) => x.address === polkadotAddress)
      if (!account) throw new Error('Account not found in extenstion')
      connect(account, dispatch)
    }
  } catch (err) {
    console.error(err)
    clear(USER_POLKADOT_ADDRESS)
  }
}

export const getAccounts = async () => {
  const { web3Accounts, web3Enable } = await import('@polkadot/extension-dapp')
  const extensions = await web3Enable('ternoa-bridge')
  if (extensions.length === 0)
    throw new Error(
      'polkadot{.js} extension is not installed.\n\nOtherwise make sure you allowed Ternoa Bridge application in the "Manage Website Access" settings of your wallet.'
    )
  const allAccounts = await web3Accounts()
  return allAccounts
}

export const connect = async (account: InjectedAccountWithMeta, dispatch: (action: AnyAction) => void) => {
  const { web3FromSource } = await import('@polkadot/extension-dapp')
  const injector = await web3FromSource(account.meta.source)
  const data = {
    address: account.address,
    injector,
    capsBalance: await getBalance(account.address),
  }
  dispatch(actions.loginPolkadot(data))
}

export const getNativeTokenId = async () => {
  const api = await getApi()
  return api.consts.erc20Bridge.nativeTokenId.toString()
}

export const ss58ToHex = (address: string) => {
  return u8aToHex(decodeAddress(address))
}

export const getBridgeFees = () => {
  return BRIDGE_FEES
}

//TODO
export const getTransferFees = async (user: User, amount: number) => {
  if (!user) throw new Error('User not found')
  if (!user.polkadotWallet) throw new Error("User's Polkadot account not found")
  if (!user.ercWallet) throw new Error('User ERC account not found')
  const formattedAmount = formatInput(amount)
  const tx = api.tx.erc20Bridge.transferNative(formattedAmount, user.ercWallet.address, ETH_DEST_ID)
  const info = await tx.paymentInfo(user.polkadotWallet.address)
  return formatBalance(info.partialFee.toString(), 6).toString()
}

//TODO
export const transfer = async (
  user: User,
  amount: number,
  setResponse: (response: { message: string; txLink: string; isError: boolean }) => void
) => {
  if (!user) throw new Error('User not found')
  if (!user.polkadotWallet) throw new Error("User's Polkadot account not found")
  if (!user.ercWallet) throw new Error('User ERC account not found')
  const api = await getApi()
  const address = user.polkadotWallet.address
  const injector = user.polkadotWallet.injector
  const formattedAmount = formatInput(amount)
  const tx = api.tx.erc20Bridge.transferNative(formattedAmount, user.ercWallet.address, ETH_DEST_ID)
  await tx.signAndSend(address, { signer: injector.signer }, async (data) => {
    const { status, events } = data
    if (status.isInBlock) {
      const blockHash = status.asInBlock
      const blockNumber = (await api.rpc.chain.getHeader(blockHash)).number.toNumber()
      const success = events.find((x) => api.events.system.ExtrinsicSuccess.is(x.event))
      const txLink = `https://explorer.ternoa.com/block/${blockNumber}`
      let message = 'Extrinsic failed'
      let isError = true
      if (success) {
        message = 'Your balance will be availble in few moment (may take up to 1 day)'
        isError = false
      }
      setResponse({
        message,
        txLink,
        isError,
      })
    } else {
      console.log(`Current status: ${status.type}`)
    }
  })
}
