import { cryptoWaitReady } from '@polkadot/util-crypto'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types'
import { AnyAction } from 'redux'
import { actions } from '../redux/user/actions'
import BN from 'bn.js'

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
