import React, { useState } from 'react'

import Bep20 from 'assets/svgComponents/Networks/Bep20'
import Erc20 from 'assets/svgComponents/Networks/Erc20'
import TernoaChain from 'assets/svgComponents/Networks/TernoaChain'
import Button from 'components/ui/Button'

import { middleEllipsis } from 'utils/strings'

import styles from './NetworkInput.module.scss'

interface Props {
  address?: string
  balance?: string
  className?: string
  isConnected?: boolean
  network: 'erc20' | 'bep20' | 'other'
  onClick: React.MouseEventHandler<HTMLButtonElement>
}

const NetworkInput = ({ address, balance, className, isConnected = false, network, onClick }: Props) => {
  const [isConnectButtonHovering, setIsConnectButtonHovering] = useState(false)

  const buttonColor = !isConnected ? 'primary100' : isConnectButtonHovering ? 'danger' : 'success'
  const buttonText = !isConnected ? 'Connect Wallet' : isConnectButtonHovering ? 'Disconnect' : 'Connected'

  const networkColor = () => {
    switch (network) {
      case 'erc20':
        return '#352b60'
      case 'bep20':
        return '#45393c'
      default:
        return '#471e40'
    }
  }

  const networkIcon = () => {
    switch (network) {
      case 'erc20':
        return <Erc20 className={styles.networkIcon} />
      case 'bep20':
        return <Bep20 className={styles.networkIcon} />
      default:
        return <TernoaChain className={styles.networkIcon} />
    }
  }

  const networkName = () => {
    switch (network) {
      case 'erc20':
        return 'Ethereum Network'
      case 'bep20':
        return 'Binance Smart Chain'
      default:
        return 'Ternoa Chain'
    }
  }

  return (
    <button className={[`${styles.root}`, className].join(' ')} onClick={onClick}>
      <div className={styles.network}>
        <div className={styles.icon} style={{ background: networkColor() }}>
          {networkIcon()}
        </div>
        <div className={styles.data}>
          <div className={styles.networkName}>{networkName()}</div>
          {isConnected && (
            <div className={styles.networkData}>
              <span className={styles.balance}>{`${balance} CAPS`}</span>
              {address && <span className={styles.address}>{middleEllipsis(address)}</span>}
            </div>
          )}
        </div>
      </div>
      <div onMouseEnter={() => setIsConnectButtonHovering(true)} onMouseLeave={() => setIsConnectButtonHovering(false)}>
        <Button
          color={buttonColor}
          size="small"
          onClick={(e) => {
            e.stopPropagation()
            console.log('Connect network')
          }}
          text={buttonText}
          variant="rounded"
        />
      </div>
    </button>
  )
}

export default NetworkInput
