import React, { useEffect, useState } from 'react'

import Metamask from 'assets/svgComponents/Providers/Metamask'
import WalletConnect from 'assets/svgComponents/Providers/WalletConnect'
import Button from 'components/ui/Button'
import Modal from 'components/ui/Modal'
import { ChainType } from 'interfaces'
import { connect } from 'helpers/bridge'
import { actions } from 'redux/app/actions'
import { useAppDispatch, useAppSelector } from 'redux/hooks'

import styles from './WalletModal.module.scss'

interface Props {
  chainType: ChainType
  isOpen: boolean
}

const ErcWalletModal = ({ chainType, isOpen }: Props) => {
  const [isWindowEthAvailable, setIsWindowEthAvailable] = useState(false)
  const dispatch = useAppDispatch()
  const { app } = useAppSelector((state) => state.app)
  const { fromNetwork, toNetwork, originForConnection } = app

  const isNetworkSwitchAllowed =
    (originForConnection === 'from' &&
      ((fromNetwork === 'erc20' && toNetwork !== 'bep20') || (fromNetwork === 'bep20' && toNetwork !== 'erc20'))) ||
    (originForConnection === 'to' && fromNetwork === 'ternoa')

  const handleModalClose = () => {
    dispatch(actions.setIsErcWalletModalOpen(false))
  }

  useEffect(() => {
    setIsWindowEthAvailable(typeof window !== 'undefined' && window.ethereum ? true : false)
  }, [])

  return (
    <Modal handleClose={handleModalClose} isOpen={isOpen}>
      <div className={styles.root}>
        <h4 className={styles.title}>Connect your wallet</h4>
        <div className={styles.wallets}>
          {isWindowEthAvailable && (
            <Button
              color="dark"
              icon={<Metamask />}
              onClick={() => {
                try {
                  connect(chainType, dispatch, 'metamask', undefined, isNetworkSwitchAllowed)
                  handleModalClose()
                } catch (error) {
                  console.error(error)
                }
              }}
              size="medium"
              text="Metamask"
              variant="rounded"
            />
          )}
          <Button
            color="dark"
            icon={<WalletConnect />}
            onClick={() => {
              try {
                connect(chainType, dispatch, 'walletConnect')
                handleModalClose()
              } catch (error) {
                console.error(error)
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
