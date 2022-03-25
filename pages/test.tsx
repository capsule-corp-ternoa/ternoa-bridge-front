import Head from 'next/head'
import { useEffect, useState } from 'react'

import { switchBSCNetwork, switchETHNetwork, connect as connectMetamask } from '../helpers/metamask'
import { connect as connectWalletConnect } from '../helpers/walletconnect'
import {
  getTransferFees as getTransferFeesErc,
  transfer as transferEthBsc,
  reconnect as reconnectErc,
} from '../helpers/erc'
import {
  connect as connectPolkadot,
  getAccounts,
  transfer as transferPolka,
  getTransferFees as getTransferFeesPolka,
  reconnect as reconnectPolkadot,
} from '../helpers/polkadot'

import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { actions } from '../redux/user/actions'

export default function Test() {
  const { user } = useAppSelector((state) => state.user)
  const dispatch = useAppDispatch()
  const [estimateFees, setEstimateFees] = useState('')
  const [estimateFeesPolka, setEstimateFeesPolka] = useState('')

  useEffect(() => {
    reconnectErc(dispatch)
    reconnectPolkadot(dispatch)
  }, [dispatch])

  return (
    <div className="container">
      <Head>
        <title>Ternoa Bridge</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div>User ERC Data:</div>
        <div>{`- connected ${user.isConnectedErc}`}</div>
        <div>{`- address: ${user.ercWallet?.address}`}</div>
        <div>{`- chainId: ${user.ercWallet?.chainId}`}</div>
        <div>{`- connectedWith: ${user.ercWallet?.connectedWith}`}</div>
        <div>{`- capsBalance: ${user.ercWallet?.capsBalance}`}</div>
        <div>{`- EstimateFees: ${estimateFees}`}</div>
        {user.ercWallet?.chainType === 'other' && <div>BAD NETWORK !</div>}
        {user.isConnectedErc === false && (
          <button onClick={() => connectMetamask(dispatch)}>Connect ERC Metamask</button>
        )}
        {user.isConnectedErc === false && (
          <button onClick={() => connectWalletConnect(dispatch)}>Connect ERC WalletConnect</button>
        )}
        {user.isConnectedErc === true &&
          user.ercWallet?.connectedWith === 'metamask' &&
          user.ercWallet?.chainType !== 'bep20' && (
            <button onClick={() => switchBSCNetwork()}>Add / Switch to bsc network</button>
          )}
        {user.isConnectedErc === true &&
          user.ercWallet?.connectedWith === 'metamask' &&
          user.ercWallet?.chainType !== 'erc20' && (
            <button onClick={() => switchETHNetwork()}>Add / Switch to eth network</button>
          )}
        {user.isConnectedErc === true && (
          <button
            onClick={async () => {
              if (user.ercWallet) {
                setEstimateFees(await getTransferFeesErc(user.ercWallet.signer))
              }
            }}
          >
            Estimate fees for 100 caps
          </button>
        )}
        {user.isConnectedErc === true && (
          <button
            onClick={async () => {
              if (user.ercWallet) {
                try {
                  const tx = await transferEthBsc(user.ercWallet?.signer)
                  const receipt = await tx.wait()
                  console.log('receipt', receipt)
                  console.log('etherscan link', `https://etherscan.io/tx/${receipt.transactionHash}`)
                } catch (e) {
                  console.error('transfer error', e)
                }
              }
            }}
          >
            Bridge 100 caps from ERC
          </button>
        )}
        {user.isConnectedErc === true && <button onClick={() => dispatch(actions.logoutErc())}>Logout ERC</button>}
        <br />
        <br />
        <br />
        <div>User Polkadot Data</div>
        <div>{`- connected: ${user.isConnectedPolkadot}`}</div>
        <div>{`- address: ${user.polkadotWallet?.address}`}</div>
        <div>{`- capsBalance: ${user.polkadotWallet?.capsBalance}`}</div>
        <div>{`- EstimateFees: ${estimateFeesPolka}`}</div>
        {user.isConnectedPolkadot === false && (
          <button
            onClick={async () => {
              const accounts = await getAccounts()
              const account = accounts[3]
              connectPolkadot(account, dispatch)
            }}
          >
            Connect Polkadot
          </button>
        )}
        {user.isConnectedPolkadot === true && (
          <button
            onClick={async () => {
              if (user.polkadotWallet) {
                setEstimateFeesPolka(await getTransferFeesPolka(user.polkadotWallet))
              }
            }}
          >
            Estimate fees for 100 caps
          </button>
        )}
        {user.isConnectedPolkadot === true && (
          <button
            onClick={async () => {
              if (user.polkadotWallet) {
                try {
                  await transferPolka(user.polkadotWallet)
                } catch (e) {
                  console.error('transfer error', e)
                }
              }
            }}
          >
            Bridge 100 caps from Polkadot
          </button>
        )}
        {user.isConnectedPolkadot === true && (
          <button onClick={() => dispatch(actions.logoutPolkadot())}>Logout Polkadot</button>
        )}
        <br />
      </main>

      <footer>FOOTERR</footer>
    </div>
  )
}
