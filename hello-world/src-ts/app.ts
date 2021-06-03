import {app, stack} from "./demena-stack";
import {CloudFormationDeployments} from "aws-cdk/lib/api/cloudformation-deployments";
import {Bootstrapper, SdkProvider} from "aws-cdk";
import {CredentialProviderChain, Credentials} from "aws-sdk";


export const lambdaHandler = async () => {
    await deployStack().then((result) => {
        console.log(result.stackArtifact.id)
    })
}

function bootstrapStack(sdkProvider: SdkProvider) {
    const bootstrapper = new Bootstrapper({source: "default"})
    bootstrapper.bootstrapEnvironment({
        account: process.env.MY_ACCOUNT_ID,
        region: process.env.AWS_REGION,
        name: "myaccountmilaenv"
    }, sdkProvider, {
        execute: true, parameters: {
            bucketName: "demenagroupmilabucket",
            cloudFormationExecutionPolicies: ["arn:aws:iam::aws:policy/AWSCloudFormationFullAccess"],
            trustedAccounts: [process.env.MY_ACCOUNT_ID]
        },
    })
}

function deployStack() {
    const credentials = new Credentials({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID
        , secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    })
    const credentialProviderChain = new CredentialProviderChain();
    credentialProviderChain.providers.push(credentials)
    const sdkProvider = new SdkProvider(credentialProviderChain, process.env.AWS_REGION, {
        credentials,
    });
    bootstrapStack(sdkProvider);
    const cloudFormationDeployments = new CloudFormationDeployments({sdkProvider})
    return cloudFormationDeployments.deployStack({
        stack: app.synth().getStackByName(stack.stackName),
        quiet: true,
    })
}