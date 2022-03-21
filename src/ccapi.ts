import { Connection } from "./model";
import { v4 as uuidv4 } from 'uuid';

export class PublicStateForm {
    stateId: string;
    dataType: string;
    data: string;
    pid: string;
}

export class PrivateStateForm {
    id: string;
    stateId: string;
    data: string;
    targets: string[];
}

export async function createState(ccp: Connection): Promise<string> {
    const stateId = generateDataId();
    const dataType = "emaildev";
    const targets = ["org3MSP"];

    console.log(`createState, dataId: ${stateId}`);

    // 1. submit private data
    const pform = new PrivateStateForm();
    pform.id = generateDataId();
    pform.stateId = stateId;
    pform.data = generatePrivateData();
    pform.targets = targets; 
    await submitPrivateData(ccp, pform);
    console.log("create private data success");
    // return pform.id;

    // submit public data
    const publicForm = new PublicStateForm();
    publicForm.stateId = stateId;
    publicForm.dataType = dataType;
    publicForm.data = generatePublicData();
    publicForm.pid = pform.id;

    await submitPublicData(ccp, publicForm);
    return stateId;
}

export async function queryStateById(ccp: Connection, id: string): Promise<any> {
    const result = await ccp.contract.evaluateTransaction("GetStateById", id);
    console.log(`*** Result: ${prettyJSONString(result.toString())}`);
}

export async function queryPriavteStateById(ccp: Connection, id: string): Promise<any> {
    const result = await ccp.contract.evaluateTransaction("GetStatePrivateById", id);
    console.log(`*** Result: ${prettyJSONString(result.toString())}`);
}

async function submitPrivateData(ccp: Connection, form: PrivateStateForm): Promise<string> {
    // return private data id
    const formBuffer = Buffer.from(JSON.stringify(form));
    const tKey = getTransientKey();

    const tData = Object();
    tData[tKey] = formBuffer;

    const result = await ccp.contract.createTransaction('CreateStatePrivate')
    .setTransient(tData)
    .submit(tKey);

    console.log("private data submitted");
    console.log(result);
    console.log(result.toString());

    return "";
}

async function submitPublicData(ccp: Connection, form: PublicStateForm) {
    const args = JSON.stringify(form);
    const result = await ccp.contract.submitTransaction('CreateState', args);
    console.log("pulic data submitted");
    console.log(JSON.stringify(result));
}

function generateDataId(): string {
    return uuidv4();
}

function getTransientKey(): string {
    return Date.now().toString()
}

function generatePublicData(): string {
    const data = {
        "id": generateDataId(),
        "consumerId": generateDataId(),
        "consumerName": "cname",
        "providerId": generateDataId(),
        "providerName": "pname",
        "scope": {
            "udr": "test udr",
            "valid": "2022-01-01",
            "expiry": "2022-12-31",
        },
        "otherInfo": "moreinfo",
    };

    return JSON.stringify(data);
}

function generatePrivateData(): string {
    const data = {
        "name": "privateDataName",
        "now": Date.now().toString(),
        "age": 10,
    };
    return JSON.stringify(data);
}

function prettyJSONString(inputString: string) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}