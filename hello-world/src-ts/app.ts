import {app, demenaStack} from "./demena-stack";
import {CloudFormationDeployments} from "aws-cdk/lib/api/cloudformation-deployments";
import {Bootstrapper, SdkProvider} from "aws-cdk";
import {CredentialProviderChain, Credentials} from "aws-sdk";
import {CdkToolkit} from "aws-cdk/lib/cdk-toolkit";
import {Configuration} from "aws-cdk/lib/settings";
import {CloudExecutable} from "aws-cdk/lib/api/cxapp/cloud-executable";
import {RequireApproval} from "aws-cdk/lib/diff";
import * as cxapi from '@aws-cdk/cx-api';
import * as cdk from "@aws-cdk/core";

const AWSREGION = process.env.AWS_REGION
// const ACCOUNTID = process.env.MY_ACCOUNT_ID
const AccessKeyId = process.env.AWS_ACCESS_KEY_ID
const SecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY


export const lambdaHandler = async () => {
    console.log("IN IT!!")
    deployStack()
}

function fetchSDKProvider() {
    const credentials = new Credentials({
        accessKeyId: AccessKeyId
        , secretAccessKey: SecretAccessKey
    })
    const credentialProviderChain = new CredentialProviderChain();
    credentialProviderChain.providers.push(credentials)
    return new SdkProvider(credentialProviderChain, AWSREGION, {
        credentials,
    });

}

function deployStack() {
    const sdkProvider = fetchSDKProvider();
    console.log("REGION: " + sdkProvider.defaultRegion)
    const cloudFormationDeployments = new CloudFormationDeployments({sdkProvider})

    const configurationContext = new Configuration({readUserContext: true})

    const cloudExecutable = new CloudExecutable({
        configuration: configurationContext, sdkProvider: sdkProvider, synthesizer(aws: SdkProvider, config: Configuration): Promise<cxapi.CloudAssembly> {
            aws = sdkProvider
            config = configurationContext
            return Promise.resolve(new cxapi.CloudAssembly(app.synth().directory))
        },
    })

    const cdkToolkit = new CdkToolkit({
        cloudExecutable: cloudExecutable,
        cloudFormation: cloudFormationDeployments,
        configuration: configurationContext,
        verbose: false,
        sdkProvider: sdkProvider
    })

    const bootstrapper = new Bootstrapper({source: "legacy"})

    cdkToolkit.list([demenaStack.stackName]).then((result) => {
        console.log("NAME: " + result)
    })

    cdkToolkit.synth([demenaStack.stackName], true, true)

    cdkToolkit.bootstrap([demenaStack.environment], bootstrapper, {execute: true})

    cdkToolkit.deploy({
        stackNames: [demenaStack.stackName],
        execute: true,
        requireApproval: RequireApproval.Never,
    })
}

