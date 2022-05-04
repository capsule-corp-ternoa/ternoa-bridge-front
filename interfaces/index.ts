import { Signer } from 'ethers'
import type { InjectedExtension } from '@polkadot/extension-inject/types'

export type ERCProvider = 'metamask' | 'walletconnect'
export const AVAILABLE_NETWORKS = ['erc20', 'bep20', 'ternoa', 'other'] as const
export type ChainType = typeof AVAILABLE_NETWORKS[number]

export interface ErcWallet {
  address: string
  capsBalance: number
  chainId: number
  chainType: ChainType
  signer: Signer
  connectedWith: ERCProvider
}

export interface PolkadotWallet {
  address: string
  injector: InjectedExtension
  capsBalance: number
}

export interface User {
  isConnectedErc: boolean
  isConnectedPolkadot: boolean
  ercWallet?: ErcWallet
  polkadotWallet?: PolkadotWallet
}

export enum TransactionLifeCycleStatus {
  TX_PENDING,
  TX_SUCCESS,
  TX_FAILED,
}

export const RESPONSE_DEFAULT_STATE = {
  body: undefined,
  explorerLink: undefined,
  isTxSubmitted: false,
  newErcBalance: undefined,
  newPolkadotBalance: undefined,
  status: TransactionLifeCycleStatus.TX_PENDING,
  txHash: undefined,
  voteTxs: undefined,
}

export interface ITx {
  hash: string
  link: string
  isError?: boolean
}

export interface IResponse {
  body?: string
  isTxSubmitted?: boolean
  newErcBalance?: number
  newPolkadotBalance?: number
  status: TransactionLifeCycleStatus
  tx?: ITx
  voteTxs?: ITx[]
}

export type ResponseNominalSetState = React.Dispatch<React.SetStateAction<IResponse>>
