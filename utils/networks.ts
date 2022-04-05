import { AnyAction } from 'redux'

import { ChainType } from 'interfaces'
import { actions as appActions } from 'redux/app/actions'

const ALLOWED_TRANSFERS = {
  erc20: ['ternoa', 'bep20'],
  bep20: ['erc20'],
  ternoa: ['erc20'],
  other: undefined,
}

export const handleNetworkPair = (
  from: ChainType,
  to: ChainType,
  origin: 'from' | 'to' | undefined,
  network: ChainType,
  dispatch: (action: AnyAction) => void
) => {
  const newAutoAssignedNetwork: ChainType | undefined =
    network === 'other' ? undefined : (ALLOWED_TRANSFERS[network][0] as ChainType)

  switch (origin) {
    case 'from': {
      dispatch(appActions.setFromNetwork(network))
      if ((to === network || !ALLOWED_TRANSFERS[to]?.some((item) => item === network)) && newAutoAssignedNetwork) {
        dispatch(appActions.setToNetwork(newAutoAssignedNetwork))
      }
      break
    }
    case 'to': {
      dispatch(appActions.setToNetwork(network))
      if ((from === network || !ALLOWED_TRANSFERS[from]?.some((item) => item === network)) && newAutoAssignedNetwork) {
        dispatch(appActions.setFromNetwork(newAutoAssignedNetwork))
      }
      break
    }
    default:
      break
  }
}
