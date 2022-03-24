import React from 'react'

import { useAppSelector } from 'redux/hooks'

import Arrow from 'assets/svgComponents/Arrow'
import Switch from 'assets/svgComponents/Switch'
import NetworkInput from 'components/base/NetworkInput'
import Button from 'components/ui/Button'
import Input from 'components/ui/Input'

import styles from './Transfer.module.scss'

const Transfer = () => {
  const { user } = useAppSelector((state) => state.user)

  const balance = user.ercWallet?.capsBalance

  return (
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
            network="erc20"
            onClick={() => console.log('Open Network Modal')}
          />
        </div>

        <div className={styles.switch}>
          <div className={styles.separator} />
          <button className={styles.switchButton}>
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
            network="other"
            onClick={() => console.log('Open Network Modal')}
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
  )
}

export default Transfer
