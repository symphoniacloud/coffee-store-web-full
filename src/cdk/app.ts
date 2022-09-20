#!/usr/bin/env node
import 'source-map-support/register';
import {App, Stack} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Website} from "@symphoniacloud/cdk-website";
import {CoffeeStoreWebFullStackProps, createCoffeeStoreWebFullStackProps} from "./envProps";

const DEFAULT_STACK_NAME = 'coffee-store-web-full'

class CoffeeStoreWebFull extends Stack {
    constructor(scope: Construct, id: string, props: CoffeeStoreWebFullStackProps) {
        super(scope, id, props);

        new Website(this, 'Website', {
            customDomain: props.customDomain,
            content: {
                // If you build your site before deployment then change this path to that of your build output
                path: '../site',
                performCacheInvalidation: props.performCacheInvalidation
            },
            preProcessFunctionCode: {fromPath: '../cloudfront/preProcessFunction.js'},
            additionalDefaultBehaviorOptions: props.additionalDefaultBehaviorOptions
        })
    }
}

const app = new App();
new CoffeeStoreWebFull(app, 'CoffeeStoreWebFull', createCoffeeStoreWebFullStackProps(app, DEFAULT_STACK_NAME));