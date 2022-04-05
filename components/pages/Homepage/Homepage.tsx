import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'redux/hooks'

import { ErcWalletModal, PolkadotWalletModal } from 'components/base/Modals/WalletModal'
import Transfer from 'components/base/Transfer'
import { reconnect } from 'helpers/bridge'
import { switchETHNetwork } from 'helpers/metamask'
import { get, USER_ERC_CONNECTED_WITH } from 'helpers/storage'
import { handleNetworkPair } from 'utils/networks'

import styles from './Homepage.module.scss'

const Homepage = () => {
  const [isMetamaskAutoReconnected, setIsMetamaskAutoReconnected] = useState(false)
  const dispatch = useAppDispatch()
  const { app } = useAppSelector((state) => state.app)
  const { user } = useAppSelector((state) => state.user)

  const { fromNetwork: from, toNetwork: to, chainTypeForConnection: chainType } = app

  const isErcWalletModalOpen = app.isErcWalletModalOpen && (chainType === 'erc20' || chainType === 'bep20')
  const isPolkadotWalletModalOpen = app.isPolkadotWalletModalOpen && chainType === 'ternoa'

  useEffect(() => {
    reconnect(dispatch)
    const ercConnectedWith = get(USER_ERC_CONNECTED_WITH)
    if (ercConnectedWith === 'metamask') {
      setIsMetamaskAutoReconnected(true)
    }
  }, [dispatch])

  useEffect(() => {
    if (isMetamaskAutoReconnected && user.ercWallet?.connectedWith === 'metamask') {
      const metamaskChainType = user.ercWallet.chainType
      if (metamaskChainType === 'bep20') handleNetworkPair(from, to, 'from', metamaskChainType, dispatch)
      else {
        if (metamaskChainType !== 'erc20') switchETHNetwork()
        handleNetworkPair('erc20', to, 'from', 'erc20', dispatch)
      }
      setIsMetamaskAutoReconnected(false)
    }
  }, [dispatch, from, isMetamaskAutoReconnected, to, user.ercWallet])

  useEffect(() => {
    const body = document.querySelector('body')
    if (body) {
      if (isErcWalletModalOpen || isPolkadotWalletModalOpen) body.style.overflow = 'hidden'
      else body.style.overflow = 'auto'
    }
  }, [isErcWalletModalOpen, isPolkadotWalletModalOpen])

  return (
    <main className="container">
      <div className={`wrapper ${styles.root}`}>
        <h1 className={styles.mobileTitle}>Token Bridge</h1>
        <p className={styles.mobileDescription}>
          The safest and fastest way to swap your ERC20 CAPS to Ternoa Native CAPS.
        </p>
        <div className={styles.transfer}>
          <Transfer />
        </div>
        <div className={styles.body}>
          <h1 className={styles.laptopTitle}>Token Bridge</h1>
          <p className={styles.laptopDescription}>
            The safest and fastest way to swap your ERC20 CAPS to Ternoa Native CAPS.
          </p>
          <div className={styles.indicator} />
          <p className={styles.insight}>
            💡 Unlike many other bridges, the Ternoa Bridge will lock your ERC20 CAPS and mint the equivalent in native
            CAPS on the Ternoa Network.
          </p>
          <p className={styles.insight}>
            - In case you decide to sell your native CAPS, you will need to transfer it back to the Ethereum network by
            using the Ternoa Bridge again.
          </p>
          <p className={styles.insight}>
            - The native CAPS are necessary to take part in staking and rewards, as well as paying transaction fees in
            the Ternoa ecosystem.
          </p>
        </div>
      </div>
      {isErcWalletModalOpen && <ErcWalletModal chainType={chainType} />}
      {isPolkadotWalletModalOpen && <PolkadotWalletModal />}
    </main>
  )
}

export default Homepage
