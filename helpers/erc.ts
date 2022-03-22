import { ethers, Contract, Signer } from 'ethers'
import { CAPS_CONTRACT_ABI } from './abis'
import { ERCProvider, ErcWallet } from '../interfaces'

const NUMBER_OF_DECIMALS = 18

// export const ETH_CHAIN_ID = 1 // REAL VALUE
const ETH_CHAIN_ID = 4 // TEST VALUE
const BSC_CHAIN_ID = 56

const BSC_ETH_BRIDGE_ADDRESS = '0xE83eA178D7FE5a7dfFD597d5e887d99d279Aa030'

// export const CAPS_TOKEN_ADDRESS_ETH = '0x03be5c903c727ee2c8c4e9bc0acc860cca4715e2' // REAL VALUE
const CAPS_TOKEN_ADDRESS_ETH = '0xcE9D9Db4264a50aEF8B5627E882Ed71dF66d2105' // TEST VALUE
const CAPS_TOKEN_ADDRESS_BSC = '0xffba7529ac181c2ee1844548e6d7061c9a597df4'

// export const PROVIDER_BASE_URL_ETH = `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}` // REAL VALUE
const PROVIDER_BASE_URL_ETH = `https://rinkeby.infura.io/v3/${process.env.NEXT_PUBLIC_RINKEBY_ID}` // TEST VALUE
const PROVIDER_BASE_URL_BSC = 'https://bsc-dataseed.binance.org/'

const getTokenContract = async (signer: Signer) => {
  const chainId = await signer.getChainId()
  const tokenContractAddress = chainId === ETH_CHAIN_ID ? CAPS_TOKEN_ADDRESS_ETH : CAPS_TOKEN_ADDRESS_BSC
  const contract = new Contract(tokenContractAddress, CAPS_CONTRACT_ABI, signer)
  return contract
}

const getDefaultProvider = async (chainId: number) => {
  const providerUrl = chainId === ETH_CHAIN_ID ? PROVIDER_BASE_URL_ETH : PROVIDER_BASE_URL_BSC
  const provider = ethers.providers.getDefaultProvider(providerUrl)
  return provider
}

// const getTokenContractByProvider = async (chainId: number) => {
//   const tokenContractAddress = chainId === ETH_CHAIN_ID ? CAPS_TOKEN_ADDRESS_ETH : CAPS_TOKEN_ADDRESS_BSC
//   const provider = await getDefaultProvider(chainId)
//   const contract = new Contract(tokenContractAddress, CAPS_CONTRACT_ABI, provider)
//   return contract
// }

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

export const getBalance = async (signer: Signer) => {
  const chainId = await signer.getChainId()
  if (chainId !== ETH_CHAIN_ID && chainId !== BSC_CHAIN_ID) return '0'
  const contract = await getTokenContract(signer)
  const balance = await contract.balanceOf(await signer.getAddress())
  return ethers.utils.formatUnits(balance)
}

export const getEstimateFees = async (signer: Signer, functionName: string, args: any[] = []) => {
  const chainId = await signer.getChainId()
  if (chainId !== ETH_CHAIN_ID && chainId !== BSC_CHAIN_ID) throw new Error('Invalid chain id for gas estimation')
  const contract = await getTokenContract(signer)
  const gasLimit = await contract.estimateGas[functionName](...args)
  const defaultProvider = await getDefaultProvider(chainId)
  const gasPrice = await defaultProvider.getGasPrice()
  const fees = ethers.utils.formatEther(gasPrice.mul(gasLimit))
  return fees
}

export const getTransferFees = async (signer: Signer, amount = 100) => {
  const numberOfTokens = ethers.utils.parseUnits(amount.toString(), NUMBER_OF_DECIMALS)
  const fees = await getEstimateFees(signer, 'transfer', [BSC_ETH_BRIDGE_ADDRESS, numberOfTokens])
  return fees
}

// export const getBridgeFees = async (signer: Signer) => {
// }
// export const getClaimFees = async (signer: Signer) => {
// }

export const transfer = async (signer: Signer, amount = 100) => {
  const chainId = await signer.getChainId()
  if (chainId !== ETH_CHAIN_ID && chainId !== BSC_CHAIN_ID) throw new Error('Invalid chain id for transfer')
  const contract = await getTokenContract(signer)
  const numberOfTokens = ethers.utils.parseUnits(amount.toString(), NUMBER_OF_DECIMALS)
  return contract.transfer(BSC_ETH_BRIDGE_ADDRESS, numberOfTokens)
}
