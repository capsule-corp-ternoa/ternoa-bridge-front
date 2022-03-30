import React, { useState } from 'react'

import Bep20 from 'assets/svgComponents/Networks/Bep20'
import Erc20 from 'assets/svgComponents/Networks/Erc20'
import TernoaChain from 'assets/svgComponents/Networks/TernoaChain'
import Button from 'components/ui/Button'

import { getAddress, getBalance, isConnected as isConnectedHelper } from 'helpers/bridge'
import { ChainType } from 'interfaces'
import { actions as appActions } from 'redux/app/actions'
import { actions as userActions } from 'redux/user/actions'
import { useAppDispatch, useAppSelector } from 'redux/hooks'
import { formatPrice, middleEllipsis } from 'utils/strings'

import styles from './NetworkInput.module.scss'

interface Props {
  className?: string
  forceIsConnected?: boolean
  network: ChainType
  noConnectButton?: boolean
  onClick: React.MouseEventHandler<HTMLDivElement>
  variant: 'input' | 'preview'
}

const NetworkInput = ({
  className,
  forceIsConnected = false,
  network = 'ternoa',
  noConnectButton = false,
  onClick,
  variant,
}: Props) => {
  const dispatch = useAppDispatch()
  const [isConnectButtonHovering, setIsConnectButtonHovering] = useState(false)

  const { user } = useAppSelector((state) => state.user)

  const isConnected = isConnectedHelper(network, user) || forceIsConnected
  const isBadNetwork = !isConnected && user.isConnectedErc && (network === 'erc20' || network === 'bep20')

  const getButtonColor = () => {
    if (isConnected) {
      if (isConnectButtonHovering) {
        return 'danger'
      }
      return 'success'
    } else if (isBadNetwork) {
      return 'danger'
    }

    return 'primary100'
  }

  const getButtonText = () => {
    if (isConnected) {
      if (isConnectButtonHovering) {
        return 'Disconnect'
      }
      return 'Connected'
    } else if (isBadNetwork) {
      if (isConnectButtonHovering) {
        return 'Disconnect'
      }
      return 'Bad Network'
    }

    return 'Connect Wallet'
  }

  const address = getAddress(network, user)
  const balance = getBalance(network, user)

  const networkColor = () => {
    switch (network) {
      case 'erc20':
        return '#352b60'
      case 'bep20':
        return '#45393c'
      case 'ternoa':
      default:
        return '#471e40'
    }
  }

  const handleWallet = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation()

    if ((isConnected || isBadNetwork) && (network === 'erc20' || network === 'bep20')) {
      dispatch(userActions.logoutErc())
    } else if (isConnected && network === 'ternoa') {
      dispatch(userActions.logoutPolkadot())
    } else {
      dispatch(appActions.setChainTypeForConnection(network))
      switch (network) {
        case 'erc20':
        case 'bep20':
          dispatch(appActions.setIsErcWalletModalOpen(true))
          break
        case 'ternoa':
          dispatch(appActions.setIsPolkadotWalletModalOpen(true))
          break
        default:
          break
      }
    }
  }

  return (
    <div
      className={[`${styles.root}`, `${variant === 'input' ? styles.rootInput : ''}`, className].join(' ')}
      onClick={variant === 'input' ? onClick : undefined}
    >
      <div className={styles.network}>
        <div className={styles.icon} style={{ background: networkColor() }}>
          {
            {
              erc20: <Erc20 className={styles.networkIcon} />,
              bep20: <Bep20 className={styles.networkIcon} />,
              ternoa: <TernoaChain className={styles.networkIcon} />,
              other: undefined,
            }[network]
          }
        </div>
        <div className={styles.data}>
          <div className={styles.networkName}>
            {
              {
                erc20: 'Ethereum Network',
                bep20: 'Binance Smart Chain',
                ternoa: 'Ternoa Chain',
                other: undefined,
              }[network]
            }
          </div>
          {isConnected && variant === 'input' && (
            <div className={styles.networkData}>
              {balance !== undefined && <span className={styles.balance}>{`${formatPrice(balance, {})} CAPS`}</span>}
              {address && <span className={styles.address}>{middleEllipsis(address)}</span>}
            </div>
          )}
        </div>
      </div>
      {variant === 'input' && !noConnectButton && (
        <div
          className={styles.connectButton}
          onMouseEnter={() => setIsConnectButtonHovering(true)}
          onMouseLeave={() => setIsConnectButtonHovering(false)}
        >
          <Button
            color={getButtonColor()}
            size="small"
            onClick={handleWallet}
            text={getButtonText()}
            variant="rounded"
          />
        </div>
      )}
      {variant === 'preview' && (
        <div className={styles.walletData}>
          {address && <div className={styles.address}>{middleEllipsis(address)}</div>}
          <div className={styles.connectChip}>
            <div className={styles.outterChip} />
            <div className={styles.innerChip} />
          </div>
        </div>
      )}
    </div>
  )
}

export default NetworkInput
