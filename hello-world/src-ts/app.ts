import {app, demenaStack} from "./demena-stack";
import {CloudFormationDeployments} from "aws-cdk/lib/api/cloudformation-deployments";
import {Bootstrapper, SdkProvider} from "aws-cdk";
import {CredentialProviderChain} from "aws-sdk";
import AWS = require("aws-sdk");


const AwsRegion = process.env.AWS_REGION
const AccessKeyId = process.env.AWS_ACCESS_KEY_ID
const SecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY


export const lambdaHandler = () => {
    console.log("REGION: " + AwsRegion.toLocaleLowerCase())
    const sdkProvider = fetchSDKProvider();
    let bootStrap = cdkBootStrapEnv(sdkProvider)
    bootStrap.then(value => {
        if (value.stackArtifact.stackName != null) {
            deployDemenaStack(sdkProvider)
                .then(value => console.log("NAME: " + value.stackArtifact.stackName))
                .catch(reason => {
                    console.log("Deploy error: " + reason.message)
                });
        }
    }).catch(reason => {
        console.log("Bootstrap error: " + reason.message)
    })

}

function fetchSDKProvider() {
    const credentials = new AWS.Credentials({
        accessKeyId: AccessKeyId
        , secretAccessKey: SecretAccessKey
    })
    const credentialProviderChain = new CredentialProviderChain();
    credentialProviderChain.providers.push(credentials)
    return new SdkProvider(credentialProviderChain, AwsRegion, {
        credentials,
    });
}

async function cdkBootStrapEnv(sdkProvider: SdkProvider) {
    const cdkEnvironment = app.synth().getStackByName(demenaStack.stackName).environment
    const bootstrapper = new Bootstrapper({source: 'default'})
    return await Promise.resolve(bootstrapper.bootstrapEnvironment({
        account: cdkEnvironment.account,
        name: cdkEnvironment.name,
        region: cdkEnvironment.region
    }, sdkProvider, {
        execute: true,
        parameters: {
            cloudFormationExecutionPolicies: ["arn:aws:iam::aws:policy/AWSCloudFormationFullAccess"],
            trustedAccounts: [cdkEnvironment.account],
            trustedAccountsForLookup: [cdkEnvironment.account]
        }
    }))
}

async function deployDemenaStack(sdkProvider: SdkProvider) {
    const cloudFormationDeployments = new CloudFormationDeployments({sdkProvider})
    return await Promise.resolve(cloudFormationDeployments.deployStack({
            stack: app.synth().getStackByName(demenaStack.stackName),
            execute: true, quiet: true,
            notificationArns: [],
        })
    )

}

