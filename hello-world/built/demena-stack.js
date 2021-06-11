"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.demenaStack = exports.DemenaStack = void 0;
const cdk = require("@aws-cdk/core");
const ec2 = require("@aws-cdk/aws-ec2");
const aws_ec2_1 = require("@aws-cdk/aws-ec2");
const iam = require("@aws-cdk/aws-iam");
const cdk_ec2_key_pair_1 = require("cdk-ec2-key-pair");
class DemenaStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const defaultVpc = new ec2.Vpc(this, 'VPC');
        const role = new iam.Role(this, 'simple-instance-role', { assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com') });
        const defaultSecurityGroup = new ec2.SecurityGroup(this, "simple-ec2-instance-sg", {
            vpc: defaultVpc,
            securityGroupName: 'simple-ec2-instance-sg',
            description: 'ec2 instance security group',
            allowAllOutbound: true
        });
        defaultSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow SSH');
        defaultSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP');
        defaultSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'Allow HTTPS');
        defaultSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(3306), 'Allow MySql');
        const ec2KeyPair = new cdk_ec2_key_pair_1.KeyPair(this, 'ec2-key-Pair', {
            name: 'ec2-key-Pair',
            description: 'This is a Key Pair',
        });
        const awsAMI = new ec2.AmazonLinuxImage({ generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2 });
        const instance = new ec2.Instance(this, 'simple-ec2-instance', {
            vpc: defaultVpc,
            securityGroup: defaultSecurityGroup,
            instanceName: 'simple-ec2-instance',
            instanceType: aws_ec2_1.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
            machineImage: awsAMI,
            keyName: 'simple-key-pair'
        });
    }
}
exports.DemenaStack = DemenaStack;
const app = new cdk.App();
exports.demenaStack = new DemenaStack(app, 'AppStack', {
    env: {
        region: process.env.AWS_REGION || process.env.CDK_DEFAULT_REGION,
        account: process.env.MY_ACCOUNT_ID || process.env.CDK_DEFAULT_ACCOUNT
    }
});
//# sourceMappingURL=demena-stack.js.map