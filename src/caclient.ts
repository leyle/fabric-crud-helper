import FabricCAServices from "fabric-ca-client";
import { Connection } from './model';

export function buildCAClient(ccp: Connection) {
  const caInfo = ccp.raw.certificateAuthorities[ccp.caName];
  const caTLSCACerts = caInfo.tlsCACerts.pem;
  const client = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);
  console.debug(`create ca client: ${ccp.caName}`);
  return client;
}

async function enrollAdmin(ccp: Connection) {
  const enrollId = ccp.registrar.username;
  const secret = ccp.registrar.password;
  try {
    const identity = await ccp.walletObj.get(enrollId);
    if(identity) {
      console.info(`An identity for the admin user[${enrollId}] already exists in the wallet`);
      return;
    }

    const enrollment = await ccp.caClient.enroll({
      enrollmentID: enrollId,
      enrollmentSecret: secret,
    });
    
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: ccp.mspid,
      type: 'X.509',
    };

    await ccp.walletObj.put(enrollId, x509Identity);
    console.info(`enroll admin user[${enrollId}] successed`);
  } catch (error) {
    console.error(`enroll admin user[${enrollId}] failed, ${error}`);
    throw error;
  }
}

async function registerUser(ccp: Connection, username: string, password: string, affiliation: string) {
  try {
    const identity = await ccp.walletObj.get(username);
    if(identity) {
      console.log(`user[${username}] has already been registered`);
      return;
    }

    // get admin info
    // insure admin has already enrolled
    await enrollAdmin(ccp);
    const adminIdentity = await ccp.walletObj.get(ccp.registrar.username);
    if (!adminIdentity) {
      const err = "register user, but admin account doens't enroll";
      console.error(err);
      throw new Error(err);
    }

    const provider = ccp.walletObj.getProviderRegistry().getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, ccp.registrar.username);

    const respSecret = await ccp.caClient.register({
      affiliation: affiliation,
      enrollmentID: username,
      enrollmentSecret: password,
      maxEnrollments: -1,
      role: 'client',
    }, adminUser);

    console.info(`register ca user[${username}] success`);
    return;
  } catch (error) {
    const emsg: string = JSON.stringify(error);
    if(emsg.includes('already registered')) {
      return;
    }
    console.error(`register user[${username}] failed, ${error}`);
    throw error;
  }
}

async function enrollUser(ccp: Connection, username: string, password: string) {
  try {
    const identity = await ccp.walletObj.get(username);
    if(identity) {
      console.log(`user[${username}] has already been enrolled`);
      return;
    }

    const enrollment = await ccp.caClient.enroll({
      enrollmentID: username,
      enrollmentSecret: password,
    });
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: ccp.mspid,
      type: 'X.509',
    };

    await ccp.walletObj.put(username, x509Identity);
    console.info(`enroll admin user[${username}] successed`);
  } catch (error) {
    console.error(`enroll admin user[${username}] failed, ${error}`);
    throw error;
  }
}

export async function registerAndEnrollUser(ccp: Connection, username: string, passwd: string, affiliation: string) {
  try {
    await registerUser(ccp, username, passwd, affiliation);
    await enrollUser(ccp, username, passwd);
  } catch (error) {
    throw error;
  }
}