#!/bin/bash

# To test this script locally, run a command such as: `VERCEL_ENV=preview VERCEL_GIT_COMMIT_REF= ./vercel-ignore-build-step.sh && echo $?`
# References: https://vercel.com/docs/concepts/projects/environment-variables/system-environment-variables
echo "VERCEL_ENV: $VERCEL_ENV"
echo "VERCEL_GIT_COMMIT_REF: $VERCEL_GIT_COMMIT_REF"

if [[ "$VERCEL_ENV" != "production" && "$VERCEL_GIT_COMMIT_REF" != "main" && "$VERCEL_GIT_COMMIT_REF" != "staging" && "$VERCEL_GIT_COMMIT_REF" != "feat/*" && "$VERCEL_GIT_COMMIT_REF" != "feature/*"  ]] ; then
  # Proceed with the build
  echo "✅ - Build cancelled"
  exit 0;
else
  # Check if the app is affected or not
  npx nx-ignore app;
  exit $?
fi
