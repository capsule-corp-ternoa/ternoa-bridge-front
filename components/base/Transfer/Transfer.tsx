import React, { useState } from 'react'

import { useAppSelector } from 'redux/hooks'

import Arrow from 'assets/svgComponents/Arrow'
import Switch from 'assets/svgComponents/Switch'
import NetworkModal from 'components/base/Modals/NetworkModal'
import NetworkInput from 'components/base/NetworkInput'
import Button from 'components/ui/Button'
import Input from 'components/ui/Input'
import { AVAILABLE_NETWORKS, ChainType } from 'interfaces'

import styles from './Transfer.module.scss'

const Transfer = () => {
  const [from, setFrom] = useState<ChainType>('erc20')
  const [to, setTo] = useState<ChainType>('other')
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false)
  const [origin, setOrigin] = useState<'from' | 'to'>('from')
  const { user } = useAppSelector((state) => state.user)

  const balance = user.ercWallet?.capsBalance

  const handleNetwork = (origin: 'from' | 'to', network: ChainType) => {
    if (origin === 'from') {
      setFrom(network)
      if (to === network) {
        setTo(AVAILABLE_NETWORKS.filter((item) => item !== network)[0])
      }
    } else {
      setTo(network)
      if (from === network) {
        setFrom(AVAILABLE_NETWORKS.filter((item) => item !== network)[0])
      }
    }
  }

  const handleNetworkSwicth = () => {
    const newFrom = to
    const newTo = from
    setFrom(newFrom)
    setTo(newTo)
  }

  return (
    <>
      <div className={styles.outterContainer}>
        <div className={styles.mainContainer}>
          <div className={styles.field}>
            <div className={styles.top}>
              <span className={styles.label}>From</span>
            </div>
            <NetworkInput
              address="0xC59999999995472"
              balance="10.000"
              className={styles.networkInput}
              isConnected
              network={from}
              onClick={() => {
                setOrigin('from')
                setIsNetworkModalOpen(true)
              }}
            />
          </div>

          <div className={styles.switch}>
            <div className={styles.separator} />
            <button className={styles.switchButton} onClick={handleNetworkSwicth}>
              <Arrow className={styles.arrowSvg} />
              <Switch />
            </button>
          </div>

          <div className={styles.field}>
            <div className={styles.top}>
              <span className={styles.label}>To</span>
            </div>
            <NetworkInput
              address="0xC59999999995472"
              balance="10.000"
              className={styles.networkInput}
              network={to}
              onClick={() => {
                setOrigin('to')
                setIsNetworkModalOpen(true)
              }}
            />
          </div>

          <Input
            className={[`${styles.field}`, `${styles.amountField}`].join(' ')}
            endComponent={<button className={styles.maxButton}>Max</button>}
            insight={balance && `Balance: ${balance} CAPS`}
            // isError
            label="Amount"
            max={balance}
            min="1" // TODO: min transfer
            name="Amount input"
            onChange={() => console.log('onChange')}
            placeholder="Enter an amount..."
            type="number"
            value={10}
          />

          <Button
            className={styles.button}
            color="primary500"
            onClick={() => console.log('Continue')}
            size="medium"
            text="Continue"
            variant="rectangle"
          />
        </div>
      </div>
      {isNetworkModalOpen && (
        <NetworkModal origin={origin} handleNetwork={handleNetwork} setExpanded={setIsNetworkModalOpen} />
      )}
    </>
  )
}

export default Transfer
