import React, { useEffect, useState } from 'react'

import { useAppDispatch, useAppSelector } from 'redux/hooks'

import Arrow from 'assets/svgComponents/Arrow'
import Switch from 'assets/svgComponents/Switch'
import ConfirmModal from 'components/base/Modals/ConfirmModal'
import LoadingModal from 'components/base/Modals/LoadingModal'
import ResultModal from 'components/base/Modals/ResultModal'
import NetworkModal from 'components/base/Modals/NetworkModal'
import NetworkInput from 'components/base/NetworkInput'
import Button from 'components/ui/Button'
import Input from 'components/ui/Input'
import { checkProceed, getBalance, isConnected, MAX_AMOUNT, MIN_AMOUNT, transfer } from 'helpers/bridge'
import { switchBSCNetwork, switchETHNetwork } from 'helpers/metamask'
import { ChainType } from 'interfaces'
import { actions as appActions } from 'redux/app/actions'
import { actions as userActions } from 'redux/user/actions'
import { handleNetworkPair } from 'utils/networks'
import { formatPrice } from 'utils/strings'

import styles from './Transfer.module.scss'

const Transfer = () => {
  const [amount, setAmount] = useState<number>(0)
  const [amountError, setAmountError] = useState<string | undefined>(undefined)
  const [transferButtonLabel, setTransferButtonLabel] = useState<string>('...')
  const [origin, setOrigin] = useState<'from' | 'to' | undefined>(undefined)
  const [response, setResponse] = useState<{ message: string; newBalance?: number; txLink: string; isError: boolean } | undefined>(undefined)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false)
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false)
  const [isResultModalOpen, setIsResultModalOpen] = useState(false)

  const dispatch = useAppDispatch()
  const { app } = useAppSelector((state) => state.app)
  const { user } = useAppSelector((state) => state.user)

  const { fromNetwork: from, toNetwork: to } = app
  const balance = isConnected(from, user) ? getBalance(from, user) : undefined

  const handleNetworkChange = (rawOrigin: 'from' | 'to' | undefined, network: ChainType) => {
    setAmount(0)
    handleNetworkPair(from, to, rawOrigin, network, dispatch)
  }

  const handleNetworkInputSwicth = async () => {
    const newFrom = to
    const newTo = from

    try {
      if (user.ercWallet?.connectedWith === 'metamask') {
        switch (newFrom) {
          case 'erc20':
            if (user.ercWallet?.chainType !== 'erc20') await switchETHNetwork()
            break
          case 'bep20':
            if (user.ercWallet?.chainType !== 'bep20') await switchBSCNetwork()
            break
          default:
            break
        }
      }
    } catch (error) {
      console.error(error)
    }

    setAmount(0)
    dispatch(appActions.setFromNetwork(newFrom))
    dispatch(appActions.setToNetwork(newTo))
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(Number(e.target.value))
  }

  const handleConfirmTransaction = async () => {
    setIsConfirmModalOpen(false)
    setIsLoadingModalOpen(true)
    await transfer(from, to, amount, user, setResponse)
  }

  const handleResultModalClose = () => {
    setIsResultModalOpen(false)
    setResponse(undefined)
  }

  useEffect(() => {
    let shouldUpdate = true

    if (shouldUpdate && response) {
      const { isError, newBalance } = response
      setIsLoadingModalOpen(false)
      setIsResultModalOpen(true)

      if (!isError) {
        if (newBalance !== undefined) {
          if (from === 'ternoa') {
            dispatch(userActions.setCapsBalancePolkadot(newBalance))
          } else {
            dispatch(userActions.setCapsBalanceErc(newBalance))
          }
        }
        setAmount(0)
      }
    }

    return () => {
      shouldUpdate = false
    }
  }, [dispatch, from, response])

  const handleCheckProceed = async () => {
    try {
      await checkProceed(from, to, amount, user)
      setTransferButtonLabel('Continue')
      setAmountError(undefined)
    } catch (error) {
      if (error instanceof Error) {
        if (error.cause?.message === 'Incorrect amount') {
          setAmountError(error.message)
          setTransferButtonLabel('Continue')
        } else if (error.cause?.message === 'Incorrect network') {
          setTransferButtonLabel(error.message)
        } else {
          console.error(error)
        }
      } else {
        console.error(error)
      }
    }
  }

  useEffect(() => {
    handleCheckProceed()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, from, to, user])

  return (
    <>
      <div className={styles.outterContainer}>
        <div className={styles.mainContainer}>
          <div className={styles.field}>
            <div className={styles.top}>
              <span className={styles.label}>From</span>
            </div>
            <NetworkInput
              className={styles.networkInput}
              network={from}
              onClick={() => {
                setOrigin('from')
                setIsNetworkModalOpen(true)
              }}
              origin="from"
              variant="input"
            />
          </div>

          <div className={styles.switch}>
            <div className={styles.separator} />
            <button className={styles.switchButton} aria-label="Switch Network" onClick={handleNetworkInputSwicth}>
              <Arrow className={styles.arrowSvg} />
              <Switch />
            </button>
          </div>

          <div className={styles.field}>
            <div className={styles.top}>
              <span className={styles.label}>To</span>
            </div>
            <NetworkInput
              className={styles.networkInput}
              forceIsConnected={((from === 'erc20' && to === 'bep20') || (from === 'bep20' && to === 'erc20')) && isConnected(from, user)}
              network={to}
              noNetworkData={(from === 'erc20' && to === 'bep20') || (from === 'bep20' && to === 'erc20')}
              onClick={() => {
                setOrigin('to')
                setIsNetworkModalOpen(true)
              }}
              origin="to"
              variant="input"
            />
          </div>

          <Input
            advise={`Min: ${formatPrice(MIN_AMOUNT, {})} CAPS / Max: ${formatPrice(MAX_AMOUNT, {})} CAPS`}
            className={[`${styles.field}`, `${styles.amountField}`].join(' ')}
            endComponent={
              <button
                className={styles.maxButton}
                disabled={balance === undefined}
                onClick={() => balance !== undefined && balance >= 0 && setAmount(balance < MAX_AMOUNT ? balance : MAX_AMOUNT)}
              >
                Max
              </button>
            }
            error={amount !== 0 ? amountError : undefined}
            insight={balance !== undefined && balance >= 0 ? `Balance: ${formatPrice(balance, {})} CAPS` : undefined}
            isError={amount !== 0 && amountError !== undefined}
            label="Amount"
            max={MAX_AMOUNT}
            min={MIN_AMOUNT}
            name="amount"
            onChange={handleAmountChange}
            placeholder="Enter an amount..."
            type="number"
            value={amount || ''}
          />

          <Button
            className={styles.button}
            color="primary500"
            disabled={transferButtonLabel !== 'Continue' || amountError !== undefined}
            onClick={() => setIsConfirmModalOpen(true)}
            size="medium"
            text={transferButtonLabel}
            variant="rectangle"
          />
        </div>
      </div>
      {isConfirmModalOpen && (
        <ConfirmModal
          amount={amount}
          handleClose={() => setIsConfirmModalOpen(false)}
          handleContinue={handleConfirmTransaction}
          isOpen={isConfirmModalOpen}
          setResponse={setResponse}
          setIsResultModalOpen={setIsResultModalOpen}
        />
      )}
      <LoadingModal isOpen={isLoadingModalOpen} />
      <ResultModal
        body={!response ? '' : response.message}
        link={!response ? '' : response.txLink}
        handleClose={handleResultModalClose}
        isError={!response ? false : response.isError}
        isOpen={isResultModalOpen}
      />
      <NetworkModal handleClose={() => setIsNetworkModalOpen(false)} handleNetworkPair={handleNetworkChange} isOpen={isNetworkModalOpen} origin={origin} />
    </>
  )
}

export default Transfer
