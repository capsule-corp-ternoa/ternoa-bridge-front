import React from 'react'

import Metamask from 'assets/svgComponents/Providers/Metamask'
import WalletConnect from 'assets/svgComponents/Providers/WalletConnect'
import Button from 'components/ui/Button'
import Modal from 'components/ui/Modal'
import { connect as connectMetamask } from 'helpers/metamask'
import { connect as connectWalletConnect } from 'helpers/walletconnect'
import { actions } from 'redux/app/actions'
import { useAppDispatch } from 'redux/hooks'

import styles from './WalletModal.module.scss'

const WalletModal = () => {
  const dispatch = useAppDispatch()

  const handleModalExpanded = (value: boolean) => {
    dispatch(actions.setIsWalletModalOpen(value))
  }

  return (
    <Modal setExpanded={handleModalExpanded}>
      <div className={styles.root}>
        <h4 className={styles.title}>Connect your wallet</h4>
        <div className={styles.wallets}>
          <Button
            color="dark"
            icon={<Metamask />}
            onClick={() => {
              connectMetamask(dispatch)
              handleModalExpanded(false)
            }}
            size="medium"
            text="Metamask"
            variant="rounded"
          />
          <Button
            color="dark"
            icon={<WalletConnect />}
            onClick={() => {
              connectWalletConnect(dispatch)
              handleModalExpanded(false)
            }}
            size="medium"
            text="Wallet Connect"
            variant="rounded"
          />
        </div>
      </div>
    </Modal>
  )
}

export default WalletModal
