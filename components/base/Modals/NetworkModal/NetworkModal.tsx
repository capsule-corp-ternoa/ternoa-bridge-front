import React from 'react'

import NetworkInput from 'components/base/NetworkInput'
import Modal from 'components/ui/Modal'

import { switchBSCNetwork, switchETHNetwork } from 'helpers/metamask'
import { ChainType } from 'interfaces'
import { useAppSelector } from 'redux/hooks'

import styles from './NetworkModal.module.scss'

export interface NetworkModalProps {
  handleNetwork: (origin: 'from' | 'to', network: ChainType) => void
  origin: 'from' | 'to'
  setExpanded: (b: boolean) => void
}

const NetworkModal = ({ handleNetwork, origin, setExpanded }: NetworkModalProps) => {
  const { user } = useAppSelector((state) => state.user)

  const handleNetworkSwitch = async (network: 'erc20' | 'bep20') => {
    try {
      if (user.ercWallet?.connectedWith === 'metamask') {
        switch (network) {
          case 'erc20':
            switchETHNetwork()
            break
          case 'bep20':
            switchBSCNetwork()
            break
          default:
            break
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Modal setExpanded={setExpanded}>
      <div className={styles.root}>
        <h4 className={styles.title}>Select the Network</h4>
        <div className={styles.networks}>
          <NetworkInput
            className={styles.networkInput}
            network="erc20"
            noConnectButton
            noNetworkData
            onClick={() => {
              if (user.isConnectedErc && origin === 'from') handleNetworkSwitch('erc20')
              handleNetwork(origin, 'erc20')
              setExpanded(false)
            }}
            variant="input"
          />
          <NetworkInput
            className={styles.networkInput}
            network="bep20"
            noConnectButton
            noNetworkData
            onClick={() => {
              if (user.isConnectedErc && origin === 'from') handleNetworkSwitch('bep20')
              handleNetwork(origin, 'bep20')
              setExpanded(false)
            }}
            variant="input"
          />
          <NetworkInput
            className={styles.networkInput}
            network="ternoa"
            noConnectButton
            noNetworkData
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
}

export default NetworkModal
