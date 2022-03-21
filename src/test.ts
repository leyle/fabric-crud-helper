import { Command, createCommand } from "commander";
import { registerAndEnrollUser } from './caclient';
import { setupFabric } from ".";
import { initContract } from './contract';
import { Connection } from './model';
import { closeFabricGateway } from './index';
import { createState, queryPriavteStateById, queryStateById } from "./ccapi";

async function debug() {
  const program = new Command();
  program
      .version('1.0.1', '-v, --version')
      .requiredOption('--ccp <value>', 'fabric connection.yaml file')
      .option('--channel <value>', 'fabric channel name', 'fabricapp')
      .option('--ccname <value>', 'chaincode name', 'state')
      .option('--wallet <value>', 'wallet path', '/tmp/wallet')
      .option('--user <value>', 'client ca username', 'test1')
      .option('--passwd <value>', 'client ca password', 'passwd');
  
  program.parse();

  const options = program.opts();

  // const ccpFile = "/tmp/org1/connection.yaml";
  // const channelName = "emalidev";
  // const chaincodeName = "basic";
  // const walletPath = "/tmp/wallet";
  // const username = "test1";
  // const passwd = "passwd";

  const ccpFile = options.ccp;
  const channelName = options.channel;
  const chaincodeName = options.ccname;
  const walletPath = options.wallet;
  const username = options.user;
  const passwd = options.passwd;

  console.log(`ccpFile: ${ccpFile}, channelName: ${channelName}, chaincode: ${chaincodeName}, wallet: ${walletPath}, caUser: ${username}`)

  const ccp = await setupFabric(ccpFile, walletPath, channelName, chaincodeName);


  await registerAndEnrollUser(ccp, username, passwd, "");

  await initContract(ccp, username);

  // await submitTransaction(ccp);
  const dataId = await createState(ccp);
  console.log("create state success");
  // const dataId = "1647339773956";

  // query result
  await queryStateById(ccp, dataId);
  // await queryPriavteStateById(ccp, dataId);

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