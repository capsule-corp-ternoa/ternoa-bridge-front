import { ChainType } from 'interfaces'
import { AnyAction, Reducer } from 'redux'

const initialState = {
  app: {
    chainTypeForConnection: undefined,
    isErcWalletModalOpen: false,
    isPolkadotWalletModalOpen: false,
  },
}

export const appReducer: Reducer<
  {
    app: {
      chainTypeForConnection: ChainType | undefined
      isErcWalletModalOpen: boolean
      isPolkadotWalletModalOpen: boolean
    }
  },
  AnyAction
> = (state = initialState, action: AnyAction) => {
  switch (action.type) {
    case 'SET_CHAIN_TYPE_FOR_CONNECTION': {
      const { value } = action
      return {
        ...state,
        app: {
          ...state.app,
          chainTypeForConnection: value,
        },
      }
    }
    case 'SET_IS_ERC_WALLET_MODAL_OPEN': {
      const { value } = action
      return {
        ...state,
        app: {
          ...state.app,
          isErcWalletModalOpen: value,
        },
      }
    }
    case 'SET_IS_POLKADOT_WALLET_MODAL_OPEN': {
      const { value } = action
      return {
        ...state,
        app: {
          ...state.app,
          isPolkadotWalletModalOpen: value,
        },
      }
    }
    default:
      return state
  }
}
