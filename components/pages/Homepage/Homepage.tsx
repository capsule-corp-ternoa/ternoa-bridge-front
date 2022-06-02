import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'redux/hooks'

import Warning from 'assets/svgComponents/Warning'
import { ErcWalletModal, PolkadotWalletModal } from 'components/base/Modals/WalletModal'
import Transfer from 'components/base/Transfer'
import Lottie from 'components/ui/Lottie'
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
  const isAlphanetEnv = Boolean(process.env.NEXT_PUBLIC_TERNOA_WSS_CHAIN_ENDPOINT?.includes('alphanet'))

  const { fromNetwork: from, toNetwork: to, chainTypeForConnection: chainType, isErcWalletModalOpen, isPolkadotWalletModalOpen } = app

  useEffect(() => {
    reconnect(dispatch)
    const ercConnectedWith = get(USER_ERC_CONNECTED_WITH)
    if (ercConnectedWith === 'metamask') {
      setIsMetamaskAutoReconnected(true)
    }
  }, [dispatch])

  useEffect(() => {
    const handleErc20NetworkSwitch = async () => {
      try {
        await switchETHNetwork()
      } catch (error) {
        console.error(error)
      }
    }

    if (isMetamaskAutoReconnected && user.ercWallet?.connectedWith === 'metamask') {
      const metamaskChainType = user.ercWallet.chainType
      if (metamaskChainType === 'bep20') handleNetworkPair(from, to, 'from', metamaskChainType, dispatch)
      else {
        if (metamaskChainType !== 'erc20') {
          handleErc20NetworkSwitch()
        }
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
      {isAlphanetEnv && (
        <div className={`wrapper ${styles.rootDisclaimer}`}>
          <div className={styles.disclaimer}>
            <div className={styles.warning}>
              <Warning className={styles.warningIcon} />
              <div className={styles.warningLabel}>WARNING</div>
            </div>
            <div className={styles.message}>
              <div>
                This Bridge is on the Alphanet network, you can try it using :
                <a className={styles.link} href="https://rinkebyfaucet.com/" target="_blank" rel="noopener noreferrer" title="Rinkeby faucet">
                  Rinkeby faucet
                </a>
                <span className={styles.separator}>&</span>
                <a className={styles.link} href="https://www.ternoa.com/alphanet" target="_blank" rel="noopener noreferrer" title="Alphanet faucet">
                  Alphanet faucet
                </a>
              </div>
              <div>
                The Mainnet version can be found here:{' '}
                <a className={styles.link} href="https://bridge.ternoa.network/" title="Bridge Mainnet">
                  Bridge Mainnet
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className={`wrapper ${styles.root}`}>
        <h1 className={styles.mobileTitle}>Token Bridge</h1>
        <p className={styles.mobileDescription}>The safest and fastest way to swap your ERC20 CAPS to Ternoa Native CAPS.</p>
        <div className={styles.transfer}>
          <Transfer />
        </div>
        <div className={styles.body}>
          <h1 className={styles.laptopTitle}>
            <div className={styles.laptopTitleToken}>Token</div>
            <Lottie className={styles.lottie} path="./lottieBridge.json" />
            <div className={styles.laptopTitleBridge}>Bridge</div>
          </h1>
          <p className={styles.laptopDescription}>The safest and fastest way to swap your ERC20 CAPS to Ternoa Native CAPS.</p>
          <ul className={styles.box}>
            <li className={styles.insight}>
              Unlike many other bridges, the Ternoa Bridge will lock your ERC20 CAPS and mint the equivalent in native CAPS on the Ternoa Network.
            </li>
            <li className={styles.insight}>
              In case you decide to sell your native CAPS, you will need to transfer it back to the Ethereum network by using the Ternoa Bridge again.
            </li>
            <li className={styles.insight}>
              The native CAPS are necessary to take part in staking and rewards, as well as paying transaction fees in the Ternoa ecosystem.
            </li>
          </ul>
        </div>
      </div>
      {(chainType === 'erc20' || chainType === 'bep20') && <ErcWalletModal chainType={chainType} isOpen={isErcWalletModalOpen} />}
      {chainType === 'ternoa' && <PolkadotWalletModal isOpen={isPolkadotWalletModalOpen} />}
    </main>
  )
}

export default Homepage
