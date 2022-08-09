#!/bin/bash

set -euo pipefail

# Assumes CDK has been bootstrapped in the current account + region

# As is, this example uses the default stack name (DEFAULT_STACK_NAME) in the CDK App source
# If you want to override the stack name, then add `-- --context stackName=YOUR_STACK_NAME` here
# e.g. the following will deploy a stack named myWebStack:
# npm run deploy -- --context stackName=myWebStack
npm run deploy
