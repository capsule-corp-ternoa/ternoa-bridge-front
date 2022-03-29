import Head from 'next/head'
import { useEffect, useState } from 'react'

import { connect, reconnect, transfer, getNetworkFees } from '../helpers/bridge'

import { getAccounts } from '../helpers/polkadot'

import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { actions } from '../redux/user/actions'

export default function Test() {
  const { user } = useAppSelector((state) => state.user)
  const dispatch = useAppDispatch()
  const [estimateFees, setEstimateFees] = useState('')
  const [estimateFeesPolka, setEstimateFeesPolka] = useState('')
  const [response, setResponse] = useState<{ message?: string; txLink?: string; isError?: boolean }>({})

  useEffect(() => {
    reconnect(dispatch)
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
        {user.ercWallet?.chainType === 'ternoa' && <div>BAD NETWORK !</div>}
        {user.isConnectedErc === false && (
          <button onClick={() => connect('erc20', dispatch, 'metamask')}>Connect ERC Metamask</button>
        )}
        {user.isConnectedErc === false && (
          <button onClick={() => connect('erc20', dispatch, 'walletConnect')}>Connect ERC WalletConnect</button>
        )}
        {user.isConnectedErc === true && (
          <button
            onClick={async () => {
              if (user.ercWallet) {
                if (user.ercWallet.chainType === 'erc20') {
                  setEstimateFees((await getNetworkFees('erc20', 'bep20', 10, user)).value)
                } else {
                  setEstimateFees((await getNetworkFees('bep20', 'erc20', 10, user)).value)
                }
              }
            }}
          >
            Estimate fees for 10 caps
          </button>
        )}
        {user.isConnectedErc === true && (
          <button
            onClick={async () => {
              if (user.ercWallet) {
                if (user.ercWallet.chainType === 'erc20') {
                  await transfer('erc20', 'bep20', 10, user, setResponse)
                } else {
                  await transfer('bep20', 'erc20', 10, user, setResponse)
                }
              }
            }}
          >
            Bridge 10 caps from ERC
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
              connect('ternoa', dispatch, undefined, account)
            }}
          >
            Connect Polkadot
          </button>
        )}
        {user.isConnectedPolkadot === true && (
          <button
            onClick={async () => {
              if (user.polkadotWallet) {
                setEstimateFeesPolka((await getNetworkFees('ternoa', 'erc20', 10, user)).value)
              }
            }}
          >
            Estimate fees for 10 caps
          </button>
        )}
        {user.isConnectedPolkadot === true && (
          <button
            onClick={async () => {
              if (user.polkadotWallet) {
                await transfer('ternoa', 'erc20', 10, user, setResponse)
              }
            }}
          >
            Bridge 10 caps from Polkadot
          </button>
        )}
        {user.isConnectedPolkadot === true && (
          <button onClick={() => dispatch(actions.logoutPolkadot())}>Logout Polkadot</button>
        )}
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        {response && JSON.stringify(response)}
      </main>

      <footer>FOOTERR</footer>
    </div>
  )
}
