import { ChainType } from 'interfaces'

export const actions = {
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
