import { Gateway, GatewayOptions } from 'fabric-network';
import { Connection } from './model';

export async function initContract(ccp: Connection, userId: string, gwOption?: GatewayOptions) {
  const gw = new Gateway();
  try {
    let gwOpt: GatewayOptions;
    if(gwOption) {
      gwOpt = gwOption;
    } else {
      gwOpt = {
        wallet: ccp.walletObj,
        identity: userId,
        discovery: {
          enabled: true,
          asLocalhost: false,
        },
      };
    }
    await gw.connect(ccp.raw, gwOpt);

    const network = await gw.getNetwork(ccp.channelName);
    const contract = await network.getContract(ccp.chaincodeName);

    ccp.gateway = gw;
    ccp.network = network;
    ccp.contract = contract;

    console.debug(`init fabric gateway success`);
    return;
  } catch (error) {
    console.error(`init fabric gateway failed, ${error}`);
    throw error;
  }
}