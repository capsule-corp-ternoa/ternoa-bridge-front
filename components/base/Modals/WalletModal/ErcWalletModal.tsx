import React from 'react'

import Metamask from 'assets/svgComponents/Providers/Metamask'
import WalletConnect from 'assets/svgComponents/Providers/WalletConnect'
import Button from 'components/ui/Button'
import Modal from 'components/ui/Modal'
import { ChainType } from 'interfaces'
import { connect } from 'helpers/bridge'
import { actions } from 'redux/app/actions'
import { useAppDispatch } from 'redux/hooks'

import styles from './WalletModal.module.scss'

interface Props {
  chainType: ChainType
}

const ErcWalletModal = ({ chainType }: Props) => {
  const dispatch = useAppDispatch()

  const handleModalExpanded = (value: boolean) => {
    dispatch(actions.setIsErcWalletModalOpen(value))
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
              try {
                connect(chainType, dispatch, 'metamask')
                handleModalExpanded(false)
              } catch (error) {
                console.log(error)
              }
            }}
            size="medium"
            text="Metamask"
            variant="rounded"
          />
          <Button
            color="dark"
            icon={<WalletConnect />}
            onClick={() => {
              try {
                connect(chainType, dispatch, 'walletConnect')
                handleModalExpanded(false)
              } catch (error) {
                console.log(error)
              }
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

export default ErcWalletModal
