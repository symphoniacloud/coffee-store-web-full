import {Environment, Fn, StackProps} from "aws-cdk-lib";
import {BehaviorOptions, CachePolicy} from "aws-cdk-lib/aws-cloudfront";

export interface CoffeeStoreWebDemoStackProps extends StackProps {
    domainName: string
    certificateArn: string
    zoneName: string
    performCacheInvalidation?: boolean
    additionalDefaultBehaviorOptions?: Omit<BehaviorOptions, 'origin'>;
}

const CoffeeStoreWebDemoStackPropsPerEnv: Record<string, CoffeeStoreWebDemoStackProps> = {
    // Prod
    // TODO - move zone here
    // No zone name - DNS is handled in management account
    // We could have an apex record on a 'blog.symphonia.io' zone, but zones cost money
    '732301731486': {
        domainName: 'coffeestorewebdemo.symphonia.io',
        certificateArn: Fn.importValue('StandardCertificate'),
        zoneName: 'TODO',
        performCacheInvalidation: true
    },
    // Test
    '443780941070': {
        domainName: 'coffeestorewebdemo.test.symphonia.io',
        certificateArn: Fn.importValue('StandardCertificate'),
        zoneName: 'test.symphonia.io',
        additionalDefaultBehaviorOptions: {
            cachePolicy: CachePolicy.CACHING_DISABLED
        }
    },
    // Mike - Dev
    // Todo - www.
    '397589511426': {
        domainName: 'coffeestorewebdemo.mike.symphonia.io',
        certificateArn: Fn.importValue('StandardCertificate'),
        zoneName: 'mike.symphonia.io',
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