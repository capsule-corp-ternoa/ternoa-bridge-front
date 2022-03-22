import Head from 'next/head'
import { useState } from 'react'

import { switchBSCNetwork, switchETHNetwork, connect as connectMetamask } from '../helpers/metamask'
import { connect as connectWalletConnect } from '../helpers/walletconnect'
import { connect as connectPolkadot, getAccounts } from '../helpers/polkadot'

import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { actions } from '../redux/user/actions'
import { getEstimateFees } from '../helpers/erc'

export default function Test() {
  const { user } = useAppSelector((state) => state.user)
  const dispatch = useAppDispatch()
  const [estimateFees, setEstimateFees] = useState('')

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
                setEstimateFees(await getEstimateFees(user.ercWallet?.signer))
              }
            }}
          >
            update fees
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
          <button onClick={() => dispatch(actions.logoutPolkadot())}>Logout Polkadot</button>
        )}
        <br />
      </main>

      <footer>FOOTERR</footer>
    </div>
  )
}
