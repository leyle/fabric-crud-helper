import { registerAndEnrollUser } from './caclient';
import { setupFabric } from ".";
import { initContract } from './contract';
import { Connection } from './model';
import { closeFabricGateway } from './index';

async function debug() {
  const ccpFile = "/tmp/org1/connection.yaml";
  const channelName = "emalidev";
  const chaincodeName = "basic";
  const walletPath = "/tmp/wallet";
  const ccp = await setupFabric(ccpFile, walletPath, channelName, chaincodeName);

  const username = "test1";
  const passwd = "passwd";

  await registerAndEnrollUser(ccp, username, passwd, "");

  await initContract(ccp, username);
  await submitTransaction(ccp);

  // close gateway
  closeFabricGateway(ccp);
}

async function submitTransaction(ccp: Connection) {
  const aid = Date.now().toString();
  const result = await ccp.contract.submitTransaction('CreateAsset', aid, 'yellow', '5', 'Tom', '1300');
  console.log('*** Result: committed');
  console.log(result);
  if(`${result}` !== '') {
    console.log(`Result: ${prettyJSONString(result.toString())}`);
  }
  await queryTransaction(ccp, aid);
}

async function queryTransaction(ccp: Connection, aid: string) {
  const result = await ccp.contract.evaluateTransaction('ReadAsset', aid);
  console.log(`*** Result: ${prettyJSONString(result.toString())}`);
}

function prettyJSONString(inputString: string) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

debug();