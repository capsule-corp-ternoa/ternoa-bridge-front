import Head from 'next/head'

import { connect as connectMetamask } from '../helpers/metamask'
import { connect as connectWalletConnect } from '../helpers/walletconnect'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { actions } from '../redux/user/actions'

export default function Test() {
  const { user } = useAppSelector((state) => state.user)
  const dispatch = useAppDispatch()

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
        {user.ercWallet?.chainType === 'other' && <div>BAD NETWORK !</div>}
        <br />
        <div>User Polkadot Data</div>
        <div>{`- connected: ${user.isConnectedPolkadot}`}</div>
        <br />
        {user.isConnectedErc === false && (
          <button onClick={() => connectMetamask(dispatch)}>Connect ERC Metamask</button>
        )}
        {user.isConnectedErc === false && (
          <button onClick={() => connectWalletConnect(dispatch)}>Connect ERC WalletConnect</button>
        )}
        {user.isConnectedErc === true && <button onClick={() => dispatch(actions.logoutErc())}>Logout ERC</button>}
      </main>

      <footer>FOOTERR</footer>
    </div>
  )
}
