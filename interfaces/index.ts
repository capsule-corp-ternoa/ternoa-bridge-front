import { Signer } from 'ethers'
import type { InjectedExtension } from '@polkadot/extension-inject/types'

export type ERCProvider = 'metamask' | 'walletconnect'
export type ChainType = 'erc20' | 'bep20' | 'other'

export interface ErcWallet {
  address: string
  capsBalance: string
  chainId: number
  chainType: ChainType
  signer: Signer
  connectedWith: ERCProvider
}

export interface PolkadotWallet {
  address: string
  injector: InjectedExtension
  capsBalance: string
}

export interface User {
  isConnectedErc: boolean
  isConnectedPolkadot: boolean
  ercWallet?: ErcWallet
  polkadotWallet?: PolkadotWallet
}
