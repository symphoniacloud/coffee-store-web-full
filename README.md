# Coffee Store Web Full - real example of a deployed website on AWS

_"Production-ready websites on AWS made slightly easier"_

There are many ways of hosting websites. If you want to host on AWS it's not as easy as it could be, but this example
will set you up for a real production website, along with development and test environments.

## Introduction

Deploying a "static" website on AWS is surprisingly tricky - it requires managing S3, CloudFront, the security between them, Route 53, and more. This example helps you wrangle all of these things, by way of using [**AWS CDK**](https://docs.aws.amazon.com/cdk/v2/guide/home.html).

This project is an extension of my [CDK bare-bones app for TypeScript](https://github.com/symphoniacloud/cdk-bare-bones) project. I recommend that you **try this first if you are getting started with CDK.**

It's also an extension of my [_Coffee Store Web Basic_](https://github.com/symphoniacloud/coffee-store-web-basic) project - adding custom domain names, setting up multiple environments, using Github Actions, and more. **If you're new to hosting websites on AWS you may want to start with the _Basic_ version first.**

To show this isn't all made up this repository is **really deployed** using the included Github Actions workflows to https://www.coffeestorewebdemo.symphonia.io/ !

## How this project works

This example deploys a CDK _App_ that uses S3 and CloudFront to host a website. It shows various techniques:

* Deploying a website on AWS with CDK using my [`cdk-website`](https://github.com/symphoniacloud/cdk-website) construct
    * Use multiple custom domain names in production (apex domain, and `www.` domain), and single custom domains elsewhere.
    * Use caching behavior and invalidations in production; use a pass-through cache without invalidations in development and test.
* Use a CloudFront Function for URL manipulation and redirects
* Use the target AWS account ID to drive CDK configuration
* Github Actions Workflows to automatically deploy to production account from `main`, and to test account from Pull Requests
    * Use Github OIDC for AWS access
    * Use a custom action for shared behavior between workflows

## Prerequisites

Please see the [prerequisites of the cdk-bare-bones](https://github.com/symphoniacloud/cdk-bare-bones#prerequisites) project - all of the prerequisites in that project also apply to this one.

Further:

* You should understand the basics of deploying websites, certificates, and DNS.
* If you are going to deploy this with a custom domain name you will need a valid certificate deployed to AWS Certificate Manager in your target account, and optionally you will need the correct Route 53 hosted zone in your target account. 

## Deployment

**NB- Don't try deploying until you've updated the environment configuration** in [_envProps.ts_](src/cdk/envProps.ts) for your own AWS account, domain name settins etc. - see the next section.

Once you've changed those you can use the included _deploy.sh_ script, or run `npm run deploy`.

## How to use

Overall I recommend you review the entire contents of this repo. Particularly relevant files are:

* [_src/cdk/*_](src/cdk) - The CDK definition files for the application, including environment properties.
* [_src/cloudfront/preProcessFunction.js_](src/cloudfront/preProcessFunction.js) - A CloudFront Function that will be run for every request
* [_src/site/*_](src/site) - Sample site content - you will want to replace this with your own, or generate content at build time
* [_.github/*_](.github) - Github Actions configuration for PR (test) and production deployment

Many of the specific elements in this repo are custom, since it is an actual deployed site. Elements that you will likely want to change if you are copying it are:

* The [per-environment properties](src/cdk/envProps.ts) will change. 
  * Note the main `CoffeeStoreWebFullStackPropsPerEnv` constant in that file **is keyed by account ID**, so these will have to change.
  * Also you'll want to change custom domain names, certificate ARN import details, and hosted zone names (assuming you want to automatically update DNS)
  * For more on this, see the [documentation for the `cdk-website` construct](https://github.com/symphoniacloud/cdk-website)
* You will want to change `DEFAULT_STACK_NAME` in [_app.ts_](src/cdk/app.ts) . You may also want to be able to change the stack name outside of that file - see comment in [_deploy.sh_](deploy.sh)
* If you are generating any content before deployment you will either want to update [_deploy.sh_](deploy.sh), or update the [custom Github Actions action](.github/actions/deploy/action.yaml) to also build and not just deploy.
  * You'll probably also want to change `content` -> `path` in [_app.ts_](src/cdk/app.ts)
* If you are just using static content in the repo, then change the contents of [_src/site_](src/site)
* Consider the ["pre process" CloudFront function](src/cloudfront/preProcessFunction.js):
  * Either delete it, and remove the `preProcessFunctionCode` property in [_app.ts_](src/cdk/app.ts) ...
  * ... or update the `manualRedirects` value in [preProcessFunction.js](src/cloudfront/preProcessFunction.js)
* If you want to use the Github Actions workflows:
  * You'll need to deploy the Github OIDC resources if you haven't done so already. See [here](https://github.com/symphoniacloud/coffee-store-v2/tree/main/github-actions-prereqs) for an example.
  * You'll also want to save the relevant role ARNs as secrets in Github Actions, and change `OPENSOURCE_ACTIONS_ROLE_ARN` in [deploy-to-prod.yaml](.github/workflows/deploy-to-prod.yaml) and `TEST_ACTIONS_ROLE_ARN` in [deploy-pr-to-test.yaml](.github/workflows/deploy-pr-to-test.yaml)
* If you don't want to use Github Actions, then delete the [.github](.github) directory.
* The "Cache Policy" for the production "environment" uses the default [_CachingOptimized_ cache policy](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-cache-policies.html) - you may want to change this.

## CDK Style

My style of using CDK is a little different from the default templates provided by AWS. For more details, and reasoning, see the [_Motivation_ section of the bare-bones project Readme](https://github.com/symphoniacloud/cdk-bare-bones#design-decisions--motivation).

## Questions / Feedback / etc.

If you have questions related to this example please add a Github issue, or drop me a line
at [mike@symphonia.io](mailto:mike@symphonia.io) . I'm also on Twitter
at [@mikebroberts](https://twitter.com/mikebroberts) .

## Changelog

### 2022.1

* Move _cdk.json_ to _src/cdk_ directory. This is for a couple of reasons:
  - One fewer file in project root, which I think is A Good Thing
  - Makes it easier to have repos with multiple, separate, CDK apps
* Modify _app.ts_ to point to new (relative) location of site content
* Move `output` and `requireApproval` CDK settings from _package.json_ to _cdk.json_
  - I hadn't read the docs enough to know they could be in _cdk.json_. Oops. This way is cleaner
* Update package-lock.json - these are specific dependency versions I've tested with