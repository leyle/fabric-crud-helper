import { Wallets } from "fabric-network";
import { Connection } from './model';

export async function buildWallet(walletPath: string) {
  try {
    const wallet = await Wallets.newFileSystemWallet(walletPath)
    return wallet;
  } catch(error) {
    console.error(`get wallet failed, ${walletPath} | ${error}`);
    throw error;
  }
}