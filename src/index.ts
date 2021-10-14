import * as core from '@actions/core';

import CodeSigner from './sign';
import * as input from './input';

async function run(actionInput: input.Input): Promise<void> {
  try {
    const signer = await new CodeSigner(actionInput.awsRegion);
    const createSignedJob = await signer.createSignedJob(actionInput.jobCommandInput);
    if (createSignedJob && createSignedJob.jobId) {
      core.debug(`createSignedJob: ${createSignedJob.jobId}`);
    }

    if (createSignedJob && createSignedJob.jobId && actionInput.waitUntilSuccessful) {
      await signer.waitUntilSuccessful(actionInput.maxWaitTime, createSignedJob.jobId);
    }
  } catch (error) {
    core.setFailed(JSON.stringify(error, null, 4));
  }
}

async function main(): Promise<void> {
  const actionInput = input.get();

  try {
    if (actionInput) {
      await run(actionInput);
    }
  } catch (error) {
    core.setFailed((<Error>error).message);
  }
}

void main();
