#!/usr/bin/env node
import 'source-map-support/register';
import {App, Stack} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Website} from "@symphoniacloud/cdk-website";
import {CoffeeStoreWebDemoStackProps, getPropsForDefaultAWSEnvironment} from "./envProps";

const DEFAULT_STACK_NAME = 'coffee-store-web-demo'

class CoffeeStoreWebDemo extends Stack {
    constructor(scope: Construct, id: string, props: CoffeeStoreWebDemoStackProps) {
        super(scope, id, props);

        new Website(this, 'Website', {
            customDomain: props.customDomain,
            content: {
                path: 'src/site',
                performCacheInvalidation: props.performCacheInvalidation
            },
            preProcessFunctionCode: {fromPath: 'src/cloudfront/preProcessFunction.js'},
            additionalDefaultBehaviorOptions: props.additionalDefaultBehaviorOptions
        })
    }
}

const app = new App();
const stackName = app.node.tryGetContext('stackName') || DEFAULT_STACK_NAME

if (!stackName)
    throw new Error('Unable to find "stackName" in context')

new CoffeeStoreWebDemo(app, 'CoffeeStoreWebDemo', getPropsForDefaultAWSEnvironment(stackName));