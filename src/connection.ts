import fs from 'fs';
import yaml from 'js-yaml';
import { Connection, Registrar } from './model';

// parse fabric connection file

function readJsonConnectionFile(filePath: string) {
  const fileExist = fs.existsSync(filePath);
  if (!fileExist) {
    throw new Error(`fabric connection file[${filePath}] doesn't exist`);
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  try {
    const data = JSON.parse(content);
    console.debug(`load connection file success, ${filePath}`);
    return data;
  } catch (error) {
    console.error(`read connection file, parse failed, ${error}`);
    throw error;
  }
}

function readYamlConnectionFile(filePath: string) {
  const fileExist = fs.existsSync(filePath);
  if (!fileExist) {
    throw new Error(`fabric connection file[${filePath}] doesn't exist`);
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  try {
    const data = yaml.load(content);
    console.debug(`load connection file success, ${filePath}`);
    return data;
  } catch (error) {
    console.error(`read connection file, parse failed, ${error}`);
    throw error;
  }
}

function parseConnectionFile(data: any): Connection {
  const client = data.client;
  const orgName = client.organization;
  const orgObj = data.organizations[orgName];
  const mspid = orgObj.mspid;
  const caName = orgObj.certificateAuthorities[0];
  const caObj = data.certificateAuthorities[caName];
  const enrollId = caObj.registrar.enrollId;
  const enrollSecret = caObj.registrar.enrollSecret;

  const registrar: Registrar = {
    username: enrollId,
    password: enrollSecret,
  }

  const cc = new Connection();
  cc.mspid = mspid;
  cc.orgName = orgName;
  cc.caName = caName;
  cc.registrar = registrar;
  cc.raw = data;

  return cc;
}

export default function readConnectionFile(filePath: string): Connection {
  let data: any;
  if (filePath.endsWith('.json')) {
    data = readJsonConnectionFile(filePath);
  } else if (filePath.endsWith(".yaml")) {
    data = readYamlConnectionFile(filePath);
  } else {
    throw new Error(`wrong fabric connection file[${filePath}], only json/yaml is valid`);
  }

  return parseConnectionFile(data);
}
