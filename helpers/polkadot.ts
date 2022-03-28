import { cryptoWaitReady } from '@polkadot/util-crypto'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types'
import { AnyAction } from 'redux'
import { actions } from '../redux/user/actions'
import BN from 'bn.js'
import { PolkadotWallet } from '../interfaces'
import { clear, get, USER_POLKADOT_ADDRESS } from './storage'
import { NUMBER_OF_DECIMALS } from './erc'

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

export const formatBalance = (balance: string) => {
  return Number(balance.slice(0, -(NUMBER_OF_DECIMALS - 3))) / 1000
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

//TODO
export const getTransferFees = async (polkadotWallet: PolkadotWallet, amount: number) => {
  const tx = api.tx.balances.transfer('5H6ShEfbS85NP23ZyHCBTgJnLaRAA3KrYyNgZDxTNssXrGnA', amount)
  const info = await tx.paymentInfo(polkadotWallet.address)
  return formatBalance(info.partialFee.toString()).toString()
}

//TODO
export const transfer = async (
  polkadotWallet: PolkadotWallet,
  amount: number,
  setResponse: (response: { message: string; txLink: string; isError: boolean }) => void
) => {
  const api = await getApi()
  const address = polkadotWallet.address
  const injector = polkadotWallet.injector
  const bnBase = new BN('1000000000000000000')
  const bnAmount = new BN(amount)
  const formattedAmount = bnAmount.mul(bnBase)
  const tx = api.tx.balances.transfer('5H6ShEfbS85NP23ZyHCBTgJnLaRAA3KrYyNgZDxTNssXrGnA', formattedAmount)
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
        message = 'Your balance will be availble in few moment (it can take up to 1 day)'
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
