import React from 'react'

import NetworkInput from 'components/base/NetworkInput'
import Modal from 'components/ui/Modal'
import { ChainType } from 'interfaces'

import styles from './NetworkModal.module.scss'

export interface NetworkModalProps {
  handleNetwork: (origin: 'from' | 'to', network: ChainType) => void
  origin: 'from' | 'to'
  setExpanded: (b: boolean) => void
}

const NetworkModal = ({ handleNetwork, origin, setExpanded }: NetworkModalProps) => (
  <Modal setExpanded={setExpanded}>
    <div className={styles.root}>
      <h4 className={styles.title}>Select the Network</h4>
      <div className={styles.networks}>
        <NetworkInput
          className={styles.networkInput}
          network="erc20"
          noConnectButton
          onClick={() => {
            handleNetwork(origin, 'erc20')
            setExpanded(false)
          }}
          variant="input"
        />
        <NetworkInput
          className={styles.networkInput}
          network="bep20"
          noConnectButton
          onClick={() => {
            handleNetwork(origin, 'bep20')
            setExpanded(false)
          }}
          variant="input"
        />
        <NetworkInput
          className={styles.networkInput}
          network="ternoa"
          noConnectButton
          onClick={() => {
            handleNetwork(origin, 'ternoa')
            setExpanded(false)
          }}
          variant="input"
        />
      </div>
    </div>
  </Modal>
)

export default NetworkModal
