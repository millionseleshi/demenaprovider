"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lambdaHandler = void 0;
const demena_stack_1 = require("./demena-stack");
const cloudformation_deployments_1 = require("aws-cdk/lib/api/cloudformation-deployments");
const aws_cdk_1 = require("aws-cdk");
const aws_sdk_1 = require("aws-sdk");
const lambdaHandler = async () => {
    await deployStack().then((result) => {
        console.log(result.stackArtifact.id);
    });
};
exports.lambdaHandler = lambdaHandler;
function bootstrapStack(sdkProvider) {
    const bootstrapper = new aws_cdk_1.Bootstrapper({ source: "default" });
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
    });
}
function deployStack() {
    const credentials = new aws_sdk_1.Credentials({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });
    const credentialProviderChain = new aws_sdk_1.CredentialProviderChain();
    credentialProviderChain.providers.push(credentials);
    const sdkProvider = new aws_cdk_1.SdkProvider(credentialProviderChain, process.env.AWS_REGION, {
        credentials,
    });
    bootstrapStack(sdkProvider);
    const cloudFormationDeployments = new cloudformation_deployments_1.CloudFormationDeployments({ sdkProvider });
    return cloudFormationDeployments.deployStack({
        stack: demena_stack_1.app.synth().getStackByName(demena_stack_1.stack.stackName),
        quiet: true,
    });
}
//# sourceMappingURL=app.js.map