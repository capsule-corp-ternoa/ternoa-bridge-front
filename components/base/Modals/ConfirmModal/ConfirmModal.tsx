import React, { useState } from 'react'

import Arrow from 'assets/svgComponents/Arrow'
import Switch from 'assets/svgComponents/Switch'
import NetworkInput from 'components/base/NetworkInput'
import Button from 'components/ui/Button'
import Modal from 'components/ui/Modal'
import Radio from 'components/ui/Radio'

import { ChainType } from 'interfaces'
import { middleEllipsis } from 'utils/strings'

import transferStyles from '../../Transfer/Transfer.module.scss'
import styles from './ConfirmModal.module.scss'

export interface ConfirmModalProps {
  from: ChainType
  to: ChainType
  handleNetworkSwicth: () => void
  setExpanded: (b: boolean) => void
  setIsNetworkModalOpen: (b: boolean) => void
  setOrigin: (origin: 'from' | 'to') => void
}

const ConfirmModal = ({
  from,
  to,
  handleNetworkSwicth,
  setExpanded,
  setIsNetworkModalOpen,
  setOrigin,
}: ConfirmModalProps) => {
  const [isTermsRadioChecked, setIsTermsRadioChecked] = useState(false)

  return (
    <Modal setExpanded={setExpanded}>
      <div className={styles.root}>
        <h4 className={styles.title}>Confirmation</h4>
        <div className={styles.inputs}>
          <div className={transferStyles.field}>
            <div className={transferStyles.top}>
              <span className={transferStyles.label}>From</span>
            </div>
            <NetworkInput
              address="0xC59999999995472"
              balance="10.000"
              className={transferStyles.networkInput}
              isConnected
              network={from}
              onClick={() => {
                setOrigin('from')
                setIsNetworkModalOpen(true)
              }}
            />
          </div>

          <div className={transferStyles.switch}>
            <div className={transferStyles.separator} />
            <button className={transferStyles.switchButton} aria-label="Switch Network" onClick={handleNetworkSwicth}>
              <Arrow className={transferStyles.arrowSvg} />
              <Switch />
            </button>
          </div>

          <div className={transferStyles.field}>
            <div className={transferStyles.top}>
              <span className={transferStyles.label}>To</span>
            </div>
            <NetworkInput
              address="0xC59999999995472"
              balance="10.000"
              className={transferStyles.networkInput}
              network={to}
              onClick={() => {
                setOrigin('to')
                setIsNetworkModalOpen(true)
              }}
            />
          </div>
        </div>
        <div className={styles.resume}>
          <div className={styles.resumeLine}>
            <span className={styles.resumeItem}>Amount</span>
            <span className={styles.resumeItem}>9500</span>
          </div>
          <div className={styles.resumeLine}>
            <span className={styles.resumeItem}>Asset</span>
            <span className={styles.resumeItem}>CAPS</span>
          </div>
          <div className={styles.resumeLine}>
            <span className={styles.resumeItem}>Destination</span>
            <span className={styles.resumeItem}>{middleEllipsis('0xC59999999995472')}</span>
          </div>
          <div className={styles.resumeLine}>
            <span className={styles.resumeItem}>*Network Fee</span>
            <span className={styles.resumeItem}>0.01 ETH</span>
          </div>
          <div className={styles.resumeLine}>
            <span className={styles.resumeItem}>You will receive</span>
            <span className={styles.resumeBoldItem}>9500 CAPS</span>
          </div>
        </div>
        <Radio
          className={styles.radio}
          checked={isTermsRadioChecked}
          name="terms"
          label="I have read and agree to the terms."
          onChange={() => setIsTermsRadioChecked(true)}
        />
        <Button
          className={styles.button}
          color="primary500"
          onClick={() => console.log('Confirm')}
          size="medium"
          text="Continue"
          variant="rectangle"
        />
        <div className={styles.advise}>
          *The network fees and execution price depend on the market condition, you may get a different rate when the
          transaction is complete
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmModal
