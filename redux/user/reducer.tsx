import { AnyAction, Reducer } from 'redux'
import { safeDisconnect } from '../../helpers/polkadot'

import { walletConnectProvider } from '../../helpers/walletconnect'
import { User } from '../../interfaces'
import { clear, store, USER_ERC_CONNECTED_WITH, USER_POLKADOT_ADDRESS } from '../../helpers/storage'

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
      store(USER_ERC_CONNECTED_WITH, value.connectedWith)
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
      clear(USER_ERC_CONNECTED_WITH)
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
      store(USER_POLKADOT_ADDRESS, value.address)
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
      safeDisconnect()
      clear(USER_POLKADOT_ADDRESS)
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
