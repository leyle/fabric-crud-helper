import { Contract, Gateway, Network, Wallet } from "fabric-network";
import FabricCAServices from 'fabric-ca-client';

export class Connection {
  // values from connection.json/yaml file
  mspid: string;
  orgName: string;
  caName: string;
  registrar: Registrar;
  raw: any;

  // values from system startup
  channelName: string;
  chaincodeName: string;

  // value from env file
  // wallet path
  walletObj: Wallet;
  caClient: FabricCAServices;
  gateway: Gateway;
  network: Network;
  contract: Contract;
}

export class Registrar {
  username: string;
  password: string;
}