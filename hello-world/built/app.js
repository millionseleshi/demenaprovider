"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lambdaHandler = void 0;
const demena_stack_1 = require("./demena-stack");
const cloudformation_deployments_1 = require("aws-cdk/lib/api/cloudformation-deployments");
const aws_cdk_1 = require("aws-cdk");
const aws_sdk_1 = require("aws-sdk");
const AWS = require("aws-sdk");
const AwsRegion = process.env.AWS_REGION;
const AccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const SecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const lambdaHandler = () => {
    console.log("IN IT!!");
    return deployDemenaStack().then(value => console.log(value.stackArtifact.stackName))
        .catch(reason => console.log("Deploy Error => " + reason.message));
};
exports.lambdaHandler = lambdaHandler;
function fetchSDKProvider() {
    const credentials = new AWS.Credentials({
        accessKeyId: AccessKeyId,
        secretAccessKey: SecretAccessKey
    });
    const credentialProviderChain = new aws_sdk_1.CredentialProviderChain();
    credentialProviderChain.providers.push(credentials);
    return new aws_cdk_1.SdkProvider(credentialProviderChain, AwsRegion, {
        credentials,
    });
}
function deployDemenaStack() {
    const sdkProvider = fetchSDKProvider();
    const cloudFormationDeployments = new cloudformation_deployments_1.CloudFormationDeployments({ sdkProvider });
    const cdkEnvironment = demena_stack_1.app.synth().getStackByName(demena_stack_1.demenaStack.stackName).environment;
    const bootstrapper = new aws_cdk_1.Bootstrapper({ source: 'default' });
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
        console.log(value.stackArtifact.name);
    }).catch(reason => console.log("Bootstrap Error => " + reason.message));
    return cloudFormationDeployments.deployStack({
        stack: demena_stack_1.app.synth().getStackByName(demena_stack_1.demenaStack.stackName),
        execute: true, quiet: true,
        notificationArns: [],
    });
}
//# sourceMappingURL=app.js.map