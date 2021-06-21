import * as cdk from '@aws-cdk/core';
import {Stack} from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import {AmazonLinuxStorage, InstanceType, MachineImage} from '@aws-cdk/aws-ec2';

export class DemenaStack extends Stack {

    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
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
        })
        defaultSecurityGroup.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(22),
            'Allow SSH'
        )

        defaultSecurityGroup.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(80),
            'Allow HTTP'
        )

        defaultSecurityGroup.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(443),
            'Allow HTTPS'
        )
        const instance = new ec2.Instance(this, 'simple-ec2-instance', {
            vpc: defaultVpc,
            securityGroup: defaultSecurityGroup,
            instanceName: 'simple-ec2-instance',
            instanceType: InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
            machineImage: MachineImage.latestAmazonLinux({
                generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
                edition: ec2.AmazonLinuxEdition.STANDARD,
                storage: AmazonLinuxStorage.GENERAL_PURPOSE,
                virtualization: ec2.AmazonLinuxVirt.HVM,
                cpuType: ec2.AmazonLinuxCpuType.X86_64
            }),
            blockDevices: [{
                deviceName: '/dev/sda1',
                volume: ec2.BlockDeviceVolume.ebs(50),
            },
            ],
        })

        const eip = new ec2.CfnEIP(this, 'Server IP', {
            instanceId: instance.instanceId
        });

        new ec2.CfnEIPAssociation(this, "simple-ec2-instance-eip", {
            eip: eip.ref,
            instanceId: instance.instanceId
        })
    }


    get availabilityZones(): string[] {
        return ['us-east-1a', 'us-east-1b', 'us-east-1c', 'us-east-1d'];
    }
}

export const app = new cdk.App();
export const demenaStack = new DemenaStack(app, 'AppStack', {
    env: {
        region: process.env.AWS_REGION || process.env.CDK_DEFAULT_REGION,
        account: process.env.MY_ACCOUNT_ID || process.env.CDK_DEFAULT_ACCOUNT
    }
});

