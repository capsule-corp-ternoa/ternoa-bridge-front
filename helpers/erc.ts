import { ethers, Contract, Signer } from 'ethers'
import { MaxUint256 } from '@ethersproject/constants'
import { BRIDGE_CONTRACT_ABI, CAPS_CONTRACT_ABI } from './abis'
import { ERCProvider, ErcWallet, User } from '../interfaces'
import { AnyAction } from 'redux'
import { clear, get, USER_ERC_CONNECTED_WITH } from './storage'
import { connect as connectMetamask } from './metamask'
import { connect as connectWalletConnect } from './walletconnect'
import { formatInput, getNativeTokenId, ss58ToHex } from './polkadot'

export const NUMBER_OF_DECIMALS = 18

// export const ETH_CHAIN_ID = 1 // REAL VALUE
export const ETH_CHAIN_ID = 5 // TEST VALUE
export const BSC_CHAIN_ID = 56

//TODO
const BSC_ETH_BRIDGE_ADDRESS = '0xE83eA178D7FE5a7dfFD597d5e887d99d279Aa030'
const TERNOA_ETH_BRIDGE_CONTRACT = '0x9C51DB0D3c464Bdb9c97e32584107168073d1D3A' //TEST VALUE GOERLI
const TERNOA_ETH_BRIDGE_HANDLER_CONTRACT = '0x9A8537baDd69a2aDbdDd74B91EceD2B69eA5b7CB' //TEST VALUE GOERLI

//TODO
// export const CAPS_TOKEN_ADDRESS_ETH = '0x03be5c903c727ee2c8c4e9bc0acc860cca4715e2' // REAL VALUE
// const CAPS_TOKEN_ADDRESS_ETH = '0xcE9D9Db4264a50aEF8B5627E882Ed71dF66d2105' // TEST VALUE RINKEBY
const CAPS_TOKEN_ADDRESS_ETH = '0xC36418f4c2f483405dA151A3fb4153E9E714AF72' // TEST VALUE GOERLI
const CAPS_TOKEN_ADDRESS_BSC = '0xffba7529ac181c2ee1844548e6d7061c9a597df4'

// export const PROVIDER_BASE_URL_ETH = `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}` // REAL VALUE
export const PROVIDER_BASE_URL_ETH = `https://goerli.infura.io/v3/${process.env.NEXT_PUBLIC_RINKEBY_ID}` // TEST VALUE
export const PROVIDER_BASE_URL_BSC = 'https://bsc-dataseed.binance.org/'

const TERNOA_DEST_ID = 1

const getTokenContract = async (signer: Signer) => {
  const chainId = await signer.getChainId()
  const tokenContractAddress = chainId === ETH_CHAIN_ID ? CAPS_TOKEN_ADDRESS_ETH : CAPS_TOKEN_ADDRESS_BSC
  const contract = new Contract(tokenContractAddress, CAPS_CONTRACT_ABI, signer)
  return contract
}

const getBridgeContract = async (signer: Signer) => {
  const contract = new Contract(TERNOA_ETH_BRIDGE_CONTRACT, BRIDGE_CONTRACT_ABI, signer)
  return contract
}

const getDefaultProvider = async (chainId: number) => {
  const providerUrl = chainId === ETH_CHAIN_ID ? PROVIDER_BASE_URL_ETH : PROVIDER_BASE_URL_BSC
  const provider = ethers.providers.getDefaultProvider(providerUrl)
  return provider
}

export const reconnect = async (dispatch: (action: AnyAction) => void) => {
  try {
    const ercConnectedWith = get(USER_ERC_CONNECTED_WITH)
    if (ercConnectedWith) {
      if (ercConnectedWith === 'metamask') {
        connectMetamask(dispatch)
      } else {
        connectWalletConnect(dispatch)
      }
    }
  } catch (err) {
    console.error(err)
    clear(USER_ERC_CONNECTED_WITH)
  }
}

export const getErcWalletFromSigner = async (signer: Signer, connectedWith: ERCProvider): Promise<ErcWallet> => {
  const chainId = await signer.getChainId()
  return {
    address: await signer.getAddress(),
    chainId: chainId,
    connectedWith: connectedWith,
    chainType: ETH_CHAIN_ID === chainId ? 'erc20' : chainId === BSC_CHAIN_ID ? 'bep20' : 'other',
    capsBalance: await getBalance(signer),
    signer,
  }
}

export const formatBalance = async (balance: string) => {
  return Number(Number(balance).toFixed(3))
}

export const getBalance = async (signer: Signer) => {
  const chainId = await signer.getChainId()
  if (chainId !== ETH_CHAIN_ID && chainId !== BSC_CHAIN_ID) return 0
  const contract = await getTokenContract(signer)
  const balance = await contract.balanceOf(await signer.getAddress())
  return formatBalance(ethers.utils.formatUnits(balance))
}

export const isApproved = async (signer: Signer) => {
  const contract = await getTokenContract(signer)
  const owner = await signer.getAddress()
  const spender = TERNOA_ETH_BRIDGE_HANDLER_CONTRACT
  const amount = await contract.allowance(owner, spender)
  return amount > 0
}

export const approve = async (signer: Signer) => {
  const contract = await getTokenContract(signer)
  const spender = TERNOA_ETH_BRIDGE_HANDLER_CONTRACT
  return contract.approve(spender, MaxUint256)
}

export const getEstimateFees = async (
  contract: ethers.Contract,
  signer: Signer,
  functionName: string,
  args: any[] = []
) => {
  const chainId = await signer.getChainId()
  if (chainId !== ETH_CHAIN_ID && chainId !== BSC_CHAIN_ID) throw new Error('Invalid chain id for gas estimation')
  const gasLimit = await contract.estimateGas[functionName](...args)
  const defaultProvider = await getDefaultProvider(chainId)
  const gasPrice = await defaultProvider.getGasPrice()
  const fees = ethers.utils.formatEther(gasPrice.mul(gasLimit))
  return fees
}

/* ETH <-> BSC */

export const getTransferBscEthFees = async (signer: Signer, amount: number) => {
  const numberOfTokens = ethers.utils.parseUnits(amount.toString(), NUMBER_OF_DECIMALS)
  const contract = await getTokenContract(signer)
  const fees = await getEstimateFees(contract, signer, 'transfer', [BSC_ETH_BRIDGE_ADDRESS, numberOfTokens])
  return fees
}

export const transferBscEth = async (signer: Signer, amount: number) => {
  const chainId = await signer.getChainId()
  if (chainId !== ETH_CHAIN_ID && chainId !== BSC_CHAIN_ID) throw new Error('Invalid chain id for transfer')
  const contract = await getTokenContract(signer)
  const numberOfTokens = ethers.utils.parseUnits(amount.toString(), NUMBER_OF_DECIMALS)
  return contract.transfer(BSC_ETH_BRIDGE_ADDRESS, numberOfTokens)
}

/* ETH -> TERNOA */

const formatData = (address: string, amount: number) => {
  const bnAmount = ethers.BigNumber.from(formatInput(amount).toString())
  const convertedAddress = ss58ToHex(address)
  return (
    '0x' +
    ethers.utils.hexZeroPad(bnAmount.toHexString(), 32).substring(2) +
    ethers.utils.hexZeroPad(ethers.utils.hexlify((convertedAddress.length - 2) / 2), 32).substring(2) +
    convertedAddress.substring(2)
  )
}

const getTransferEthTernoaParams = async (user: User, amount: number) => {
  if (!user) throw new Error('User not found')
  if (!user.ercWallet?.signer) throw new Error('Signer not found')
  if (!user.polkadotWallet?.address) throw new Error('Polkadot address not found')
  const destChainId = TERNOA_DEST_ID
  const ressourceId = await getNativeTokenId()
  const data = formatData(user.polkadotWallet.address, amount)
  return [destChainId, ressourceId, data]
}

export const getTransferEthTernoaFees = async (user: User, amount: number): Promise<string> => {
  if (!user) throw new Error('User not found')
  if (!user.ercWallet?.signer) throw new Error('Signer not found')
  const [destChainId, ressourceId, data] = await getTransferEthTernoaParams(user, amount)
  const contract = await getBridgeContract(user.ercWallet.signer)
  const fees = await getEstimateFees(contract, user.ercWallet.signer, 'deposit', [destChainId, ressourceId, data])
  return fees
}

export const transferEthTernoa = async (user: User, amount: number) => {
  if (!user) throw new Error('User not found')
  if (!user.ercWallet?.signer) throw new Error('Signer not found')
  const [destChainId, ressourceId, data] = await getTransferEthTernoaParams(user, amount)
  const contract = await getBridgeContract(user.ercWallet.signer)
  return contract.deposit(destChainId, ressourceId, data)
}
