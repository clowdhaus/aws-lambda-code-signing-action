import * as core from '@actions/core';

import CodeSigner from './sign';
import * as input from './input';

async function run(actionInput: input.Input): Promise<void> {
  const signer = new CodeSigner(actionInput.awsRegion);

  try {
    await signer.createSignedJob(actionInput.jobCommandInput);

    // Both options require waiting for signing job to finish
    if (actionInput.waitUntilSuccessful || actionInput.renameSignedObject) {
      await signer.waitUntilSuccessful(actionInput.maxWaitTime);

      if (actionInput.renameSignedObject) {
        const renameResult = await signer.renameSignedObject(actionInput.source, actionInput.destination);
        core.debug(`renameResult: ${JSON.stringify(renameResult, null, 4)}`);
      }
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
