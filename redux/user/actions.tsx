import { ErcWallet, PolkadotWallet } from '../../interfaces'

export const actions = {
  loginErc: (value: ErcWallet) => ({
    type: 'USER_LOGIN_ERC',
    value: value,
  }),
  logoutErc: (isDisconnect = true) => ({
    type: 'USER_LOGOUT_ERC',
    isDisconnect: isDisconnect,
  }),
  setCapsBalanceErc: (value: number) => ({
    type: 'USER_SET_CAPS_BALANCE_ERC',
    value: value,
  }),
  loginPolkadot: (value: PolkadotWallet) => ({
    type: 'USER_LOGIN_POLKADOT',
    value: value,
  }),
  logoutPolkadot: () => ({
    type: 'USER_LOGOUT_POLKADOT',
  }),
  setCapsBalancePolkadot: (value: number) => ({
    type: 'USER_SET_CAPS_BALANCE_POLKADOT',
    value: value,
  }),
}
