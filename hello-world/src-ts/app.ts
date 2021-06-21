import {app, demenaStack} from "./demena-stack";
import {CloudFormationDeployments} from "aws-cdk/lib/api/cloudformation-deployments";
import {Bootstrapper, SdkProvider} from "aws-cdk";
import {CredentialProviderChain} from "aws-sdk";
import AWS = require("aws-sdk");


const AwsRegion = process.env.AWS_REGION
const AccessKeyId = process.env.AWS_ACCESS_KEY_ID
const SecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY


export const lambdaHandler = () => {
    console.log("IN IT!!")
    return deployDemenaStack().then(value => console.log(value.stackArtifact.stackName))
        .catch(reason => console.log("Deploy Error => " + reason.message))
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

function deployDemenaStack() {
    const sdkProvider = fetchSDKProvider();

    const cloudFormationDeployments = new CloudFormationDeployments({sdkProvider})

    const cdkEnvironment = app.synth().getStackByName(demenaStack.stackName).environment

    const bootstrapper = new Bootstrapper({source: 'default'})
    bootstrapper.bootstrapEnvironment({
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
    }).then(value => {
        console.log(value.stackArtifact.name)
    }).catch(reason => console.log("Bootstrap Error => " + reason.message))

    return cloudFormationDeployments.deployStack({
        stack: app.synth().getStackByName(demenaStack.stackName),
        execute: true, quiet: true,
        notificationArns: [],
    })

}

