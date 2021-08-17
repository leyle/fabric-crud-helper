import readConnectionFile from "./connection";
import { buildCAClient } from './caclient';
import { buildWallet } from "./wallet";
import { Connection } from './model';

export async function setupFabric(ccpFile: string, walletPath: string, channelName: string, chaincodeName: string): Promise<Connection> {
  const ccp = readConnectionFile(ccpFile);
  console.debug(ccp);
  console.log(`${ccp.mspid} | ${ccp.caName} | ${ccp.registrar.username}`);

  // create ca client
  const caClient = buildCAClient(ccp);
  ccp.caClient = caClient;

  // create wallet
  const walletObj = await buildWallet(walletPath);
  ccp.walletObj = walletObj;

  ccp.channelName = channelName;
  ccp.chaincodeName = chaincodeName;

  return ccp;
}

export function closeFabricGateway(ccp: Connection) {
  if(ccp.gateway) {
    console.debug('fabric gateway closing...');
    ccp.gateway.disconnect()
  }
}