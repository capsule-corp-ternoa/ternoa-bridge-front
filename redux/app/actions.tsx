import { ChainType } from 'interfaces'

export const actions = {
  setFromNetwork: (value: ChainType) => ({
    type: 'SET_FROM_NETWORK',
    value: value,
  }),
  setToNetwork: (value: ChainType) => ({
    type: 'SET_TO_NETWORK',
    value: value,
  }),
  setOriginForConnection: (value: 'from' | 'to' | undefined) => ({
    type: 'SET_ORIGIN_FOR_CONNECTION',
    value: value,
  }),
  setChainTypeForConnection: (value: ChainType | undefined) => ({
    type: 'SET_CHAIN_TYPE_FOR_CONNECTION',
    value: value,
  }),
  setIsErcWalletModalOpen: (value: boolean) => ({
    type: 'SET_IS_ERC_WALLET_MODAL_OPEN',
    value: value,
  }),
  setIsPolkadotWalletModalOpen: (value: boolean) => ({
    type: 'SET_IS_POLKADOT_WALLET_MODAL_OPEN',
    value: value,
  }),
}
