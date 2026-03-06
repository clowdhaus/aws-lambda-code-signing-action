import * as input from './input';
import CodeSigner from './sign';

import * as core from '@actions/core';

async function run(actionInput: input.Input): Promise<void> {
  const signer = new CodeSigner(actionInput.awsRegion);

  // Create signing job
  await signer.createSignedJob(actionInput.jobCommandInput);

  // Both options require waiting for signing job to finish
  if (actionInput.waitUntilSuccessful || actionInput.renameSignedObject) {
    await signer.waitUntilSuccessful(actionInput.maxWaitTime);

    if (actionInput.renameSignedObject) {
      // Rename signed object back to original object name but under signed prefix
      const renameResult = await signer.renameSignedObject(actionInput.source, actionInput.destination);
      core.debug(`renameResult: ${JSON.stringify(renameResult, null, 4)}`);
    }
  }
}

export async function main(): Promise<void> {
  try {
    const actionInput = input.get();
    await run(actionInput);
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
}

void main();
