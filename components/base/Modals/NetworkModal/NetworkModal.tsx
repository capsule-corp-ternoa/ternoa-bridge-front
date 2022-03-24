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
          address="0xC59999999995472"
          balance="10.000"
          className={styles.networkInput}
          isConnected={false}
          network="erc20"
          noConnectButton
          onClick={() => {
            handleNetwork(origin, 'erc20')
            setExpanded(false)
          }}
        />
        <NetworkInput
          address="0xC59999999995472"
          balance="10.000"
          className={styles.networkInput}
          isConnected={false}
          network="bep20"
          noConnectButton
          onClick={() => {
            handleNetwork(origin, 'bep20')
            setExpanded(false)
          }}
        />
        <NetworkInput
          address="0xC59999999995472"
          balance="10.000"
          className={styles.networkInput}
          isConnected={false}
          network="other"
          noConnectButton
          onClick={() => {
            handleNetwork(origin, 'other')
            setExpanded(false)
          }}
        />
      </div>
    </div>
  </Modal>
)

export default NetworkModal
