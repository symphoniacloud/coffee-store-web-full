# Coffee Store Web Demo - real example of a deployed website on AWS

_"Production-ready websites on AWS with slightly less faff"_

This is a "real" instance of the Coffee Store Web repo (NB - https://github.com/symphoniacloud/coffee-store-web is currently still an old version - it will be updated soon.)

This repository is deployed using the included Github Actions workflows to https://www.coffeestorewebdemo.symphonia.io/ .

This demo shows various techniques:

* Deploying a website on AWS with CDK using Symphonia's [`cdk-website`](https://github.com/symphoniacloud/cdk-website) construct
    * Use multiple custom domain names in production (apex domain, and `www.` domain), and single custom domains elsewhere.
    * Use caching behavior and invalidations in production; use a pass-through cache without invalidations in development and test.
* Use a CloudFront Function for URL manipulation and redirects
* Use the target AWS account ID to drive CDK configuration
* Github Actions Workflows to automatically deploy to production account from `main`, and to test account from Pull Requests
    * Use Github OIDC for AWS access
    * Use a custom action for shared behavior between workflows

## How to use

This is not a "200 level" example. :) I'm assuming that if you're going to use this example then you understand CDK, deploying to AWS, and the basics of websites, certificates, and DNS.

Overall I recommend you review the entire contents of this repo. Particularly relevant files are:

* [src/cdk/*](src/cdk) - The CDK definition files for the application
* [src/cloudfront/preProcessFunction.js](src/cloudfront/preProcessFunction.js) - A CloudFront Function that will be run for every request
* [src/site/*](src/site) - Sample site content - you will want to replace this with your own, or generate content at build time
* [.github/*](.github) - Github Actions configuration for PR (test) and production deployment

Many of the specific elements in this repo are custom, since it is an actual deployed site. Elements that you will likely want to change if you are copying it are:

* The [per-environment properties](src/cdk/envProps.ts) will drastically change. 
  * Note the main `CoffeeStoreWebDemoStackPropsPerEnv` constant in that file is keyed by account ID, so these will have to change.
  * Also you'll want to change custom domain names, certificate ARN import details, and hosted zone names (assuming you want to automatically update DNS)
  * For more on this, see the [documentation for the `cdk-website` construct](https://github.com/symphoniacloud/cdk-website)
* You will want to change `DEFAULT_STACK_NAME` in [cdkApp.ts](src/cdk/cdkApp.ts) . You may also want to be able to change the stack name outside of that file, but that's beyond the scope of this demo
* If you are generating any content before deployment you will either want to update [deploy.sh](deploy.sh), or update the [custom Github Actions action](.github/actions/deploy/action.yaml) to also build and not just deploy.
  * You'll probably also want to change `content` -> `path` in [cdkApp.ts](src/cdk/cdkApp.ts)
* If you are just using static content in the repo, then change the contents of [src/site](src/site)
* Consider the ["pre process" CloudFront function](src/cloudfront/preProcessFunction.js):
  * Either delete it, and remove the `preProcessFunctionCode` property in [cdkApp.ts](src/cdk/cdkApp.ts) ...
  * ... or update the `manualRedirects` value in [preProcessFunction.js](src/cloudfront/preProcessFunction.js)
* If you want to use the Github Actions workflows:
  * You'll need to deploy the Github OIDC resources if you haven't done so already. See [here](https://github.com/symphoniacloud/coffee-store-v2/tree/main/github-actions-prereqs) for an example.
  * You'll also want to save the relevant role ARNs as secrets in Github Actions, and change `OPENSOURCE_ACTIONS_ROLE_ARN` in [deploy-to-prod.yaml](.github/workflows/deploy-to-prod.yaml) and `TEST_ACTIONS_ROLE_ARN` in [deploy-pr-to-test.yaml](.github/workflows/deploy-pr-to-test.yaml)
* If you don't want to use Github Actions, then delete the [.github](.github) directory.