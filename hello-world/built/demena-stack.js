"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.demenaStack = exports.app = exports.DemenaStack = void 0;
const cdk = require("@aws-cdk/core");
const core_1 = require("@aws-cdk/core");
const ec2 = require("@aws-cdk/aws-ec2");
const aws_ec2_1 = require("@aws-cdk/aws-ec2");
class DemenaStack extends core_1.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const defaultVpc = new ec2.Vpc(this, 'demena_app-vpc', {
            subnetConfiguration: [
                {
                    cidrMask: 24,
                    name: 'DbInstance',
                    subnetType: ec2.SubnetType.PUBLIC,
                }
            ]
        });
        const defaultSecurityGroup = new ec2.SecurityGroup(this, "simple-ec2-instance-sg", {
            vpc: defaultVpc,
            securityGroupName: 'simple-ec2-instance-sg',
            description: 'ec2 instance security group',
            allowAllOutbound: true
        });
        defaultSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow SSH');
        defaultSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP');
        defaultSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'Allow HTTPS');
        const instance = new ec2.Instance(this, 'simple-ec2-instance', {
            vpc: defaultVpc,
            securityGroup: defaultSecurityGroup,
            instanceName: 'simple-ec2-instance',
            instanceType: aws_ec2_1.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
            machineImage: aws_ec2_1.MachineImage.latestAmazonLinux({
                generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
                edition: ec2.AmazonLinuxEdition.STANDARD,
                storage: aws_ec2_1.AmazonLinuxStorage.GENERAL_PURPOSE,
                virtualization: ec2.AmazonLinuxVirt.HVM,
                cpuType: ec2.AmazonLinuxCpuType.X86_64
            }),
            blockDevices: [{
                    deviceName: '/dev/sda1',
                    volume: ec2.BlockDeviceVolume.ebs(50),
                },
            ],
        });
        const eip = new ec2.CfnEIP(this, 'Server IP', {
            instanceId: instance.instanceId
        });
        new ec2.CfnEIPAssociation(this, "simple-ec2-instance-eip", {
            eip: eip.ref,
            instanceId: instance.instanceId
        });
    }
    get availabilityZones() {
        return ['us-east-1a', 'us-east-1b', 'us-east-1c', 'us-east-1d'];
    }
}
exports.DemenaStack = DemenaStack;
exports.app = new cdk.App();
exports.demenaStack = new DemenaStack(exports.app, 'AppStack', {
    env: {
        region: process.env.AWS_REGION || process.env.CDK_DEFAULT_REGION,
        account: process.env.MY_ACCOUNT_ID || process.env.CDK_DEFAULT_ACCOUNT
    }
});
//# sourceMappingURL=demena-stack.js.map