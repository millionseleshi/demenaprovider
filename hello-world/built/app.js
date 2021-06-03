"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lambdaHandler = void 0;
const demena_stack_1 = require("./demena-stack");
const cloudformation_deployments_1 = require("aws-cdk/lib/api/cloudformation-deployments");
const aws_cdk_1 = require("aws-cdk");
const aws_sdk_1 = require("aws-sdk");
const cdk_toolkit_1 = require("aws-cdk/lib/cdk-toolkit");
const settings_1 = require("aws-cdk/lib/settings");
const cloud_executable_1 = require("aws-cdk/lib/api/cxapp/cloud-executable");
const diff_1 = require("aws-cdk/lib/diff");
const lambdaHandler = async () => {
    console.log("IN IT!!");
    deployStack();
};
exports.lambdaHandler = lambdaHandler;
function fetchSDKProvider() {
    const credentials = new aws_sdk_1.Credentials({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });
    const credentialProviderChain = new aws_sdk_1.CredentialProviderChain();
    credentialProviderChain.providers.push(credentials);
    return new aws_cdk_1.SdkProvider(credentialProviderChain, process.env.AWS_REGION, {
        credentials,
    });
}
function deployStack() {
    const sdkProvider = fetchSDKProvider();
    const cloudFormationDeployments = new cloudformation_deployments_1.CloudFormationDeployments({ sdkProvider });
    const configuration = new settings_1.Configuration({ readUserContext: true });
    const cloudExecutable = new cloud_executable_1.CloudExecutable({
        configuration: configuration,
        sdkProvider: sdkProvider,
        synthesizer: function (aws, config) {
            return Promise.resolve(demena_stack_1.app.synth());
        }
    });
    cloudExecutable.synthesize().then((result) => {
        console.log("DIR: " + result.assembly.directory);
    });
    const cdkToolkit = new cdk_toolkit_1.CdkToolkit({
        cloudExecutable: cloudExecutable,
        cloudFormation: cloudFormationDeployments,
        configuration: configuration,
        verbose: false,
        sdkProvider: sdkProvider
    });
    const bootstrapper = new aws_cdk_1.Bootstrapper({ source: "default" });
    cdkToolkit.list([demena_stack_1.demenaStack.stackName]).then((result) => {
        console.log(result);
    });
    cdkToolkit.synth([demena_stack_1.demenaStack.stackName], true, true);
    cdkToolkit.bootstrap([demena_stack_1.demenaStack.environment], bootstrapper, { execute: true });
    cdkToolkit.deploy({
        stackNames: [demena_stack_1.demenaStack.stackName],
        execute: true,
        requireApproval: diff_1.RequireApproval.Never,
        roleArn: "arn:aws:iam::aws:policy/AWSCloudFormationFullAccess",
    });
}
//# sourceMappingURL=app.js.map