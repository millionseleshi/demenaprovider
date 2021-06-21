import {App} from '@aws-cdk/core';
import {DemenaStack} from "../demena-stack";
import {haveResource} from "@aws-cdk/assert";

describe('EC2 instance is created', () => {
    test('vpc is created', () => {
        const app = new App()
        const demenaStack = new DemenaStack(app, 'DemenaStackTest')
        expect(demenaStack).toBe(haveResource('AWS::EC2::VPC', {}))
    })
})

