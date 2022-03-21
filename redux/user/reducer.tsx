import { AnyAction, Reducer } from 'redux'

import { walletConnectProvider } from '../../helpers/walletconnect'
import { User } from '../../interfaces'

const initialState = {
  user: {
    isConnectedErc: false,
    isConnectedPolkadot: false,
  },
}

export const userReducer: Reducer<{ user: User }, AnyAction> = (state = initialState, action: AnyAction) => {
  switch (action.type) {
    case 'USER_LOGIN_ERC': {
      const { value } = action
      return {
        ...state,
        user: {
          ...state.user,
          isConnectedErc: true,
          ercWallet: value,
        },
      }
    }
    case 'USER_LOGOUT_ERC': {
      const { isDisconnect } = action
      if (walletConnectProvider?.connected && isDisconnect) {
        walletConnectProvider.disconnect()
      }
      return {
        ...state,
        user: {
          ...state.user,
          isConnectedErc: false,
          ercWallet: undefined,
        },
      }
    }
    case 'USER_SET_CAPS_BALANCE_ERC': {
      const { value } = action

      if (state.user.ercWallet === undefined) return state

      return {
        ...state,
        user: {
          ...state.user,
          ercWallet: {
            ...state.user.ercWallet,
            capsBalance: value,
          },
        },
      }
    }
    case 'USER_LOGIN_POLKADOT': {
      const { value } = action
      return {
        ...state,
        user: {
          ...state.user,
          isConnectedPolkadot: true,
          polkadotWallet: value,
        },
      }
    }
    case 'USER_LOGOUT_POLKADOT': {
      return {
        ...state,
        user: {
          ...state.user,
          isConnectedPolkadot: false,
          polkadotWallet: undefined,
        },
      }
    }
    case 'USER_SET_CAPS_BALANCE_POLKADOT': {
      const { value } = action

      if (state.user.polkadotWallet === undefined) return state

      return {
        ...state,
        user: {
          ...state.user,
          polkadotWallet: {
            ...state.user.polkadotWallet,
            capsBalance: value,
          },
        },
      }
    }
    default:
      return state
  }
}
