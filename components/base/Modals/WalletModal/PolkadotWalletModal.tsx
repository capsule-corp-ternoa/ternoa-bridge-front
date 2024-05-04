import React, { useEffect, useState } from 'react'
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types'
import { Tooltip } from 'react-tooltip'

import Warning from 'assets/svgComponents/Warning'
import Modal from 'components/ui/Modal'
import { connect } from 'helpers/bridge'
import { getAccounts } from 'helpers/polkadot'
import { actions } from 'redux/app/actions'
import { useAppDispatch } from 'redux/hooks'
import { middleEllipsis } from 'utils/strings'

import styles from './WalletModal.module.scss'

interface Props {
  isOpen: boolean
}

const PolkadotWalletModal = ({ isOpen }: Props) => {
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([])
  const [error, setError] = useState<string>('')
  const dispatch = useAppDispatch()

  const handleModalClose = () => {
    dispatch(actions.setIsPolkadotWalletModalOpen(false))
  }

  useEffect(() => {
    let shouldUpdate = true
    const loadAccounts = async () => {
      try {
        const accounts = await getAccounts()
        if (shouldUpdate) setAccounts(accounts)
        dispatch(actions.setIsPolkadotWalletModalOpen(true))
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
  }, [dispatch])

  return (
    <Modal handleClose={handleModalClose} isOpen={isOpen}>
      <div className={styles.root}>
        <Tooltip id="account-warning-tooltip" opacity={0.9} />
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
                {(meta.genesisHash == '' || meta.genesisHash == null) && (
                  <div
                    data-tooltip-id="account-warning-tooltip"
                    data-tooltip-html="<p>This account is declared 'Allow use on any chain' in Polkadot extension
                <br>To remove this warning please select only to be used on 'Ternoa Mainnet' for this account</p>"
                    data-tooltip-variant="light"
                  >
                    <Warning className={styles.warningIcon} />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}

export default PolkadotWalletModal
