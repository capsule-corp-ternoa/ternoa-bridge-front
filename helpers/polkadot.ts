import { cryptoWaitReady } from '@polkadot/util-crypto'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types'
import { AnyAction } from 'redux'
import { actions } from '../redux/user/actions'
import BN from 'bn.js'
import { PolkadotWallet } from '../interfaces'
import { clear, get, USER_POLKADOT_ADDRESS } from './storage'

let api: ApiPromise

const CHAIN_ENDPOINT = 'wss://chain-dev-latest.ternoa.dev'

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

export const getBalance = async (address: string) => {
  const api = await getApi()
  const balance: { free: BN } = ((await api.query.system.account(address)) as any).data
  return balance.free.toString()
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
  if (extensions.length === 0) throw new Error('polkadot{.js} extension is not installed')
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

export const transfer = async (polkadotWallet: PolkadotWallet) => {
  const api = await getApi()
  const address = polkadotWallet.address
  const injector = polkadotWallet.injector
  const tx = api.tx.balances.transfer('5H6ShEfbS85NP23ZyHCBTgJnLaRAA3KrYyNgZDxTNssXrGnA', 10)
  await tx.signAndSend(address, { signer: injector.signer }, (data) => {
    const { status } = data
    if (status.isInBlock) {
      console.log(`Completed at block hash #${status.asInBlock.toString()}`)
    } else {
      console.log(`Current status: ${status.type}`)
    }
  })
}

export const getTransferFees = async (polkadotWallet: PolkadotWallet) => {
  const tx = api.tx.balances.transfer('5H6ShEfbS85NP23ZyHCBTgJnLaRAA3KrYyNgZDxTNssXrGnA', 10)
  const info = await tx.paymentInfo(polkadotWallet.address)
  return info.partialFee.toString()
}
