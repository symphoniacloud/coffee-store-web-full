import {Environment, Fn, StackProps} from "aws-cdk-lib";
import {BehaviorOptions, CachePolicy} from "aws-cdk-lib/aws-cloudfront";
import {WebsiteCustomDomain} from "./website";

export interface CoffeeStoreWebDemoStackProps extends StackProps {
    customDomain: WebsiteCustomDomain
    performCacheInvalidation?: boolean
    additionalDefaultBehaviorOptions?: Omit<BehaviorOptions, 'origin'>;
}

const CoffeeStoreWebDemoStackPropsPerEnv: Record<string, CoffeeStoreWebDemoStackProps> = {
    // Opensource account
    '073101298092': {
        customDomain: {
            domains: [{
                domainName: 'coffeestorewebdemo.symphonia.io',
                hostedZone: {fromDomainName: 'coffeestorewebdemo.symphonia.io'},
            }, {
                domainName: 'www.coffeestorewebdemo.symphonia.io',
                hostedZone: {fromDomainName: 'coffeestorewebdemo.symphonia.io'},
            }],
            certificate: {fromArn: Fn.importValue('StandardCertificate')}
        },
        performCacheInvalidation: true
    },
    // Test
    '443780941070': {
        customDomain: {
            domainName: 'coffeestorewebdemo.test.symphonia.io',
            hostedZone: {fromDomainName: 'test.symphonia.io'},
            certificate: {fromArn: Fn.importValue('StandardCertificate')}
        },
        additionalDefaultBehaviorOptions: {
            cachePolicy: CachePolicy.CACHING_DISABLED
        }
    },
    // Mike - Dev
    '397589511426': {
        customDomain: {
            domainName: 'coffeestorewebdemo.mike.symphonia.io',
            hostedZone: {fromDomainName: 'mike.symphonia.io'},
            certificate: {fromArn: Fn.importValue('StandardCertificate')},
        },
        additionalDefaultBehaviorOptions: {
            cachePolicy: CachePolicy.CACHING_DISABLED
        }
    },
}

export function getPropsForDefaultAWSEnvironment(stackName: string): CoffeeStoreWebDemoStackProps {
    const env = calcEnvironment()
    const appProps = CoffeeStoreWebDemoStackPropsPerEnv[env.account]

    if (!appProps)
        throw new Error(`No env props for ${JSON.stringify(env)}`)

    return {
        env, stackName, ...appProps
    }
}

export function calcEnvironment(): Required<Environment> {
    const account = process.env.CDK_DEFAULT_ACCOUNT
    const region = process.env.CDK_DEFAULT_REGION

    if (account && region)
        return {account, region}

    throw new Error('Unable to read CDK_DEFAULT_ACCOUNT or CDK_DEFAULT_REGION')
}