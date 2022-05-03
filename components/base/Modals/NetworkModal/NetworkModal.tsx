import React from 'react'

import NetworkInput from 'components/base/NetworkInput'
import Modal from 'components/ui/Modal'

import { switchBSCNetwork, switchETHNetwork } from 'helpers/metamask'
import { ChainType } from 'interfaces'
import { useAppSelector } from 'redux/hooks'

import styles from './NetworkModal.module.scss'

export interface NetworkModalProps {
  handleClose: () => void
  handleNetworkPair: (origin: 'from' | 'to' | undefined, network: ChainType) => void
  isOpen: boolean
  origin: 'from' | 'to' | undefined
}

const NetworkModal = ({ handleClose, handleNetworkPair, isOpen, origin }: NetworkModalProps) => {
  const { app } = useAppSelector((state) => state.app)
  const { user } = useAppSelector((state) => state.user)

  const handleNetworkSwitch = async (network: 'erc20' | 'bep20') => {
    try {
      if (user.ercWallet?.connectedWith === 'metamask') {
        switch (network) {
          case 'erc20': {
            try {
              await switchETHNetwork()
            } catch (error) {
              console.error(error)
            }
            break
          }
          case 'bep20': {
            try {
              await switchBSCNetwork()
            } catch (error) {
              console.error(error)
            }
            break
          }
          default:
            break
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Modal handleClose={handleClose} isOpen={isOpen}>
      <div className={styles.root}>
        <h4 className={styles.title}>Select the Network</h4>
        <div className={styles.networks}>
          <NetworkInput
            className={styles.networkInput}
            network="erc20"
            noConnectButton
            noNetworkData
            onClick={() => {
              if (user.ercWallet?.connectedWith === 'metamask' && (origin === 'from' || (origin === 'to' && app.fromNetwork === 'ternoa'))) {
                handleNetworkSwitch('erc20')
              }
              handleNetworkPair(origin, 'erc20')
              handleClose()
            }}
            variant="input"
          />
          <NetworkInput
            className={styles.networkInput}
            network="bep20"
            noConnectButton
            noNetworkData
            onClick={() => {
              if (user.ercWallet?.connectedWith === 'metamask' && origin === 'from') handleNetworkSwitch('bep20')
              handleNetworkPair(origin, 'bep20')
              handleClose()
            }}
            variant="input"
          />
          <NetworkInput
            className={styles.networkInput}
            network="ternoa"
            noConnectButton
            noNetworkData
            onClick={() => {
              if (user.ercWallet?.connectedWith === 'metamask') {
                handleNetworkSwitch('erc20')
              }
              handleNetworkPair(origin, 'ternoa')
              handleClose()
            }}
            variant="input"
          />
        </div>
      </div>
    </Modal>
  )
}

export default NetworkModal
