import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import {InstanceType} from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam'
import { KeyPair } from 'cdk-ec2-key-pair';


export class DemenaStack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const defaultVpc = new ec2.Vpc(this, 'VPC')

        const role = new iam.Role(
            this,
            'simple-instance-role',
            {assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com')}
        )

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
        defaultSecurityGroup.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(3306),
            'Allow MySql'
        )

        const ec2KeyPair = new KeyPair(this, 'ec2-key-Pair', {
            name: 'ec2-key-Pair',
            description: 'This is a Key Pair',
        })

        const awsAMI = new ec2.AmazonLinuxImage({generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2})

        const instance = new ec2.Instance(this, 'simple-ec2-instance', {
            vpc: defaultVpc,
            securityGroup: defaultSecurityGroup,
            instanceName: 'simple-ec2-instance',
            instanceType: InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
            machineImage: awsAMI,
            keyName: 'simple-key-pair'
        })
    }
}
export const app = new cdk.App();
export const demenaStack = new DemenaStack(app, 'AppStack', {
    env: {
        region: process.env.AWS_REGION || process.env.CDK_DEFAULT_REGION,
        account: process.env.MY_ACCOUNT_ID || process.env.CDK_DEFAULT_ACCOUNT
    }
});

