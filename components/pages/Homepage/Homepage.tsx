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
      {isAlphanetEnv ? (
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
      ) : (
        <div className={`wrapper ${styles.rootDisclaimer}`}>
          <div className={styles.disclaimer}>
            <div className={styles.warning}>
              <Warning className={styles.warningIcon} />
              <div className={styles.warningLabel}>WARNING</div>
            </div>
            <div className={styles.message}>Binance Smart Chain (BEP20) to Ethereum (ERC20) transactions can take upto 45 mins to process.</div>
          </div>
        </div>
      )}
      <div className={`wrapper ${styles.root}`}>
        <h1 className={styles.mobileTitle}>Token Bridge</h1>
        <p className={styles.mobileDescription}>
          {`Safest and fastest way to swap your CAPS between Ternoa Chain(native) and Ethereum (ERC20)${
            isAlphanetEnv ? '' : ', or Ethereum (ERC20) and Binance Smart Chain(BEP20)'
          }.`}
        </p>
        <div className={styles.transfer}>
          <Transfer />
        </div>
        <div className={styles.body}>
          <h1 className={styles.laptopTitle}>
            <div className={styles.laptopTitleToken}>Token</div>
            <Lottie className={styles.lottie} path="./lottieBridge.json" />
            <div className={styles.laptopTitleBridge}>Bridge</div>
          </h1>
          <p className={styles.laptopDescription}>
            {`Safest and fastest way to swap your CAPS between Ternoa Chain (native) and Ethereum (ERC20)${
              isAlphanetEnv ? '' : ', or Ethereum (ERC20) and Binance Smart Chain (BEP20)'
            }.`}
          </p>
          <ul className={styles.box}>
            <li className={styles.insight}>The native CAPS are necessary to stake, earn rewards and pay transaction fees on Ternoa chain.</li>
            {!isAlphanetEnv && (
              <>
                <li className={styles.insight}>
                  The bridge has quantum limitations to reduce network congestion. Therefore, we offer OTC bridge services for all transfers between ethereum
                  and Ternoa chain over 1M CAPS.
                </li>
                <li className={styles.insight}>
                  <div>
                    To place a request for an OTC transfer, please contact our support team:
                    <br />
                    <a className={styles.otcLink} href="mailto:otcbridge@ternoa.network" title="OTC mail contact">
                      otcbridge@ternoa.network
                    </a>
                  </div>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
      {(chainType === 'erc20' || chainType === 'bep20') && <ErcWalletModal chainType={chainType} isOpen={isErcWalletModalOpen} />}
      {chainType === 'ternoa' && <PolkadotWalletModal isOpen={isPolkadotWalletModalOpen} />}
    </main>
  )
}

export default Homepage
