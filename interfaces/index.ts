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
