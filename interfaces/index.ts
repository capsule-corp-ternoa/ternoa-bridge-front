import { Signer } from 'ethers'

export type ERCProvider = 'metamask' | 'walletconnect'
export type ChainType = 'erc20' | 'bep20' | 'other'

export interface User {
  isConnectedErc: boolean
  isConnectedPolka: boolean
  ercWallet?: {
    address: string
    capsBalance: string
    chainId: number
    chainType: ChainType
    signer: Signer
    connectedWith: ERCProvider
  }
  polkaWallet?: {
    address: string
    //accout: InjectedAccountWithMeta
    //injector: ??
  }
}
