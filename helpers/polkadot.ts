import { cryptoWaitReady } from '@polkadot/util-crypto'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types'
import { decodeAddress } from '@polkadot/util-crypto'
import { u8aToHex } from '@polkadot/util'
import { AnyAction } from 'redux'
import { actions } from '../redux/user/actions'
import BN from 'bn.js'
import { ITx, ResponseNominalSetState, RESPONSE_DEFAULT_STATE, TransactionLifeCycleStatus, User } from '../interfaces'
import { clear, get, USER_POLKADOT_ADDRESS } from './storage'
import { formatBalance, BLOCK_LIMIT, RELAYER_THRESHOLD, SLEEP_INTERVAL } from './bridge'
import { sleep } from 'utils/system'

let api: ApiPromise

const CHAIN_ENDPOINT = process.env.NEXT_PUBLIC_TERNOA_WSS_CHAIN_ENDPOINT || 'wss://mainnet.ternoa.network'
const ETH_DEST_ID = 1

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

export const formatInput = (input: number) => {
  const bnBase = new BN('1000000000000000')
  const bnAmount = new BN(Number(input.toFixed(3)) * 1000)
  return bnAmount.mul(bnBase)
}

export const getBalance = async (address: string) => {
  const api = await getApi()
  const balance: { free: BN; frozen: BN } = ((await api.query.system.account(address)) as any).data
  const availableBalance = balance.free.sub(balance.frozen)
  return formatBalance(availableBalance.toString())
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
  const TERNOA_MAINNET_GENESIS_HASH = '0x6859c81ca95ef624c9dfe4dc6e3381c33e5d6509e35e147092bfbc780f777c4e'
  const filtered = allAccounts.filter(
    (acc) => acc.meta.genesisHash == null || acc.meta.genesisHash == '' || acc.meta.genesisHash == TERNOA_MAINNET_GENESIS_HASH
  )
  return filtered
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

export const getNativeTokenId = () => {
  return '0x000000000000000000000000000000efe3f70fbf7b2348cfadb64611d05c7401'
}

export const ss58ToHex = (address: string) => {
  return u8aToHex(decodeAddress(address))
}

const getTxExplorerLink = (blockNumber: string, index?: string) => {
  return `https://explorer${process.env.NEXT_PUBLIC_TERNOA_WSS_CHAIN_ENDPOINT?.includes('alphanet') ? '-alphanet' : ''}.ternoa.${
    process.env.NEXT_PUBLIC_TERNOA_WSS_CHAIN_ENDPOINT?.includes('alphanet') ? 'dev' : 'com'
  }/block/${blockNumber}/${index ? `${blockNumber}-${index}` : ''}`
}

export const getBridgeFees = async () => {
  const api = await getApi()
  const fee = await api.query.bridge.bridgeFee()
  return formatBalance(new BN(fee.toString()).toString())
}

export const getTransferFees = async (user: User, amount: number) => {
  if (!user) throw new Error('User not found')
  if (!user.polkadotWallet) throw new Error("User's Polkadot account not found")
  if (!user.ercWallet) throw new Error('User ERC account not found')
  const api = await getApi()
  const formattedAmount = formatInput(amount)
  const tx = api.tx.bridge.deposit(formattedAmount, user.ercWallet.address, ETH_DEST_ID)
  const info = await tx.paymentInfo(user.polkadotWallet.address)
  return formatBalance(info.partialFee.toString(), 6).toString()
}

export const transfer = async (user: User, amount: number, setResponse: ResponseNominalSetState) => {
  if (!user) throw new Error('User not found')
  if (!user.polkadotWallet) throw new Error("User's Polkadot account not found")
  if (!user.ercWallet) throw new Error('User ERC account not found')
  const api = await getApi()
  const address = user.polkadotWallet.address
  const injector = user.polkadotWallet.injector
  const formattedAmount = formatInput(amount)
  const tx = api.tx.bridge.deposit(formattedAmount, user.ercWallet.address, ETH_DEST_ID)
  await tx.signAndSend(address, { signer: injector.signer }, async (data) => {
    setResponse({
      ...RESPONSE_DEFAULT_STATE,
      isTxSubmitted: true,
      voteTxs: [],
    })
    const { status, events } = data
    if (status.isFinalized) {
      const blockHash = status.asFinalized
      const blockNumber = (await api.rpc.chain.getHeader(blockHash)).number.toNumber()
      const successEvent = events.find((x) => api.events.system.ExtrinsicSuccess.is(x.event))
      const failedEvent = events.find((x) => api.events.system.ExtrinsicFailed.is(x.event))
      const newPolkadotBalance = await getBalance(address)
      if (failedEvent !== undefined) {
        setResponse((prevState) => ({
          ...prevState,
          newPolkadotBalance,
          status: TransactionLifeCycleStatus.TX_FAILED,
          tx: {
            hash: tx.toHex(),
            link: getTxExplorerLink(blockNumber.toString(), failedEvent?.phase.asApplyExtrinsic?.toString()),
            isError: true,
          },
        }))
      } else {
        setResponse((prevState) => ({
          ...prevState,
          newPolkadotBalance,
          tx: {
            hash: tx.toHex(),
            link: getTxExplorerLink(blockNumber.toString(), successEvent?.phase.asApplyExtrinsic?.toString()),
          },
        }))
      }
    } else {
      console.log(`Current status: ${status.type}`)
    }
  })
}

export const getFinalizedBlockNumber = async () => {
  const api = await getApi()
  const finalizedHash = await api.rpc.chain.getFinalizedHead()
  const finalizedHeader = await api.rpc.chain.getHeader(finalizedHash)
  const finalizedBlockNumber = finalizedHeader.number.toBn()
  return finalizedBlockNumber
}

export const waitForResponseEthTernoa = async (user: User, amount: number, setResponse: ResponseNominalSetState) => {
  const blocks: string[] = []
  const voteTxs: ITx[] = []
  if (!user.polkadotWallet) throw new Error('Polkadot address not found')
  const api = await getApi()
  const startBlockNumber = await getFinalizedBlockNumber()
  let currentBlockNumber = startBlockNumber
  while (true) {
    if (currentBlockNumber.gt(await getFinalizedBlockNumber())) {
      await sleep(SLEEP_INTERVAL)
      continue
    }
    const hash = await api.rpc.chain.getBlockHash(currentBlockNumber)
    const block = await api.rpc.chain.getBlock(hash)
    const records = (await (await api.at(hash)).query.system.events()) as any
    for (const record of records) {
      const { event } = record
      if (event.method.toString() == 'RelayerVoted') {
        const index = Number(record.phase.asApplyExtrinsic)
        const txLink = getTxExplorerLink(currentBlockNumber.toString(), index?.toString())
        const ext = block.block.extrinsics.filter((_x, i) => i === index)[0]
        const { args, hash } = ext
        const success = records.find((x: any) => {
          return api.events.system.ExtrinsicSuccess.is(x.event) && Number(x.phase.asApplyExtrinsic) === index
        })
        if (success && args[2].toString() === user.polkadotWallet.address && args[3].toString() === formatInput(amount).toString()) {
          blocks.push(`${currentBlockNumber.toString()}-${index}`)
          voteTxs.push({
            hash: hash.toString(),
            link: txLink,
          })
          setResponse((prevState) => ({
            ...prevState,
            voteTxs,
          }))
        }
      }
    }
    if (blocks.length >= RELAYER_THRESHOLD) {
      const newPolkadotBalance = await getBalance(user.polkadotWallet.address)
      setResponse((prevState) => ({
        ...prevState,
        newPolkadotBalance,
        status: TransactionLifeCycleStatus.TX_SUCCESS,
        voteTxs,
      }))
      return blocks
    }
    if (currentBlockNumber.sub(startBlockNumber).cmp(new BN(2 * BLOCK_LIMIT)) === 1) {
      throw new Error(
        "We could not find the final transaction, please contact the support if you don't receive your funds in few minutes (your funds are safe)"
      )
    }
    currentBlockNumber = currentBlockNumber.add(new BN(1))
  }
}
