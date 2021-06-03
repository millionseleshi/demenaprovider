import {app, demenaStack} from "./demena-stack";
import {CloudFormationDeployments} from "aws-cdk/lib/api/cloudformation-deployments";
import {Bootstrapper, SdkProvider} from "aws-cdk";
import {CredentialProviderChain, Credentials} from "aws-sdk";
import {CdkToolkit} from "aws-cdk/lib/cdk-toolkit";
import {Configuration} from "aws-cdk/lib/settings";
import {CloudExecutable} from "aws-cdk/lib/api/cxapp/cloud-executable";
import * as cxapi from "@aws-cdk/cx-api"
import {RequireApproval} from "aws-cdk/lib/diff";


export const lambdaHandler = async () => {
    console.log("IN IT!!")
    deployStack()
}

function fetchSDKProvider() {
    const credentials = new Credentials({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID
        , secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    })
    const credentialProviderChain = new CredentialProviderChain();
    credentialProviderChain.providers.push(credentials)
    return new SdkProvider(credentialProviderChain, process.env.AWS_REGION, {
        credentials,
    });
}

function deployStack() {
    const sdkProvider = fetchSDKProvider();
    const cloudFormationDeployments = new CloudFormationDeployments({sdkProvider})
    const configuration = new Configuration({readUserContext: true})
    const cloudExecutable = new CloudExecutable({
        configuration: configuration,
        sdkProvider: sdkProvider,
        synthesizer: function (aws: SdkProvider, config: Configuration): Promise<cxapi.CloudAssembly> {
            return Promise.resolve(app.synth());
        }
    })
    cloudExecutable.synthesize().then((result) => {
        console.log("DIR: " + result.assembly.directory)
    })

    const cdkToolkit = new CdkToolkit({
        cloudExecutable: cloudExecutable,
        cloudFormation: cloudFormationDeployments,
        configuration: configuration,
        verbose: false,
        sdkProvider: sdkProvider
    })

    const bootstrapper = new Bootstrapper({source: "default"})

    cdkToolkit.list([demenaStack.stackName]).then((result) => {
        console.log(result)
    })

    cdkToolkit.synth([demenaStack.stackName], true, true)

    cdkToolkit.bootstrap([demenaStack.environment], bootstrapper, {execute: true})

    cdkToolkit.deploy({
        stackNames: [demenaStack.stackName],
        execute: true,
        requireApproval: RequireApproval.Never,
        roleArn: "arn:aws:iam::aws:policy/AWSCloudFormationFullAccess",
    })
}