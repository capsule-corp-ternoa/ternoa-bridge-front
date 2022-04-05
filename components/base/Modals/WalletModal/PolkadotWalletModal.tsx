import React, { useEffect, useState } from 'react'
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types'

import Warning from 'assets/svgComponents/Warning'
import Modal from 'components/ui/Modal'
import { connect } from 'helpers/bridge'
import { getAccounts } from 'helpers/polkadot'
import { actions } from 'redux/app/actions'
import { useAppDispatch } from 'redux/hooks'
import { middleEllipsis } from 'utils/strings'

import styles from './WalletModal.module.scss'

const PolkadotWalletModal = () => {
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([])
  const [error, setError] = useState<string>('')
  const dispatch = useAppDispatch()

  const handleModalExpanded = (value: boolean) => {
    dispatch(actions.setIsPolkadotWalletModalOpen(value))
  }

  useEffect(() => {
    let shouldUpdate = true
    const loadAccounts = async () => {
      try {
        const accounts = await getAccounts()
        if (shouldUpdate) setAccounts(accounts)
      } catch (error) {
        console.error(error)
        if (error instanceof Error) {
          setError(error.message)
        } else {
          setError(error as string)
        }
      }
    }

    loadAccounts()

    return () => {
      shouldUpdate = false
    }
  }, [])

  return (
    <Modal setExpanded={handleModalExpanded}>
      <div className={styles.root}>
        {error !== '' && (
          <div className={styles.warning}>
            <Warning />
          </div>
        )}
        <h4 className={styles.title}>{error !== '' ? 'Something went wrong !' : 'Select your account'}</h4>
        {error !== '' ? (
          <div className={styles.errorMessage}>{error}</div>
        ) : (
          <div className={styles.accounts}>
            {accounts.map(({ address, meta }, idx) => (
              <button
                className={styles.account}
                key={address}
                onClick={() => {
                  try {
                    connect('ternoa', dispatch, undefined, accounts[idx])
                    dispatch(actions.setIsPolkadotWalletModalOpen(false))
                  } catch (error) {
                    console.log(error)
                  }
                }}
              >
                <div className={styles.accountData}>
                  {meta.name && <span className={styles.accountName}>{meta.name}</span>}
                  <span className={styles.accountAddress}>{middleEllipsis(address, 15)}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}

export default PolkadotWalletModal
