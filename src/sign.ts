import {
  SignerClient,
  StartSigningJobCommand,
  StartSigningJobCommandInput,
  StartSigningJobResponse,
  waitUntilSuccessfulSigningJob,
} from '@aws-sdk/client-signer';
// import {WaiterState} from '@aws-sdk/util-waiter';

import * as core from '@actions/core';

export default class CodeSigner {
  readonly region: string;
  readonly client: SignerClient;

  constructor(region: string) {
    this.region = region;
    this.client = new SignerClient({region});
  }

  async createSignedJob(input: StartSigningJobCommandInput): Promise<StartSigningJobResponse> {
    try {
      const command = new StartSigningJobCommand(input);
      // core.debug(JSON.stringify(input, null, 4));
      return await this.client.send(command);
    } catch (error) {
      const {requestId, cfId, extendedRequestId} = error.$metadata;
      console.error({requestId, cfId, extendedRequestId});
      core.setFailed(JSON.stringify(error, null, 4));
      throw error;
    }
  }

  async waitUntilSuccessful(maxWaitTime: number, jobId: string): Promise<void> {
    const waiterConfig = {client: this.client, minDelay: 1, maxDelay: 10, maxWaitTime};
    // core.debug(`waiterConfig: ${JSON.stringify(waiterConfig, null, 4)}`);

    const signingJobInput = {jobId};
    core.debug(`signingJobInput: ${JSON.stringify(signingJobInput, null, 4)}`);

    try {
      const waitResult = await waitUntilSuccessfulSigningJob(waiterConfig, signingJobInput);
      core.debug(`waitResult: ${JSON.stringify(waitResult, null, 4)}`);
    } catch (error) {
      core.setFailed(JSON.stringify(error, null, 4));
    }

    // switch (waitResult.state) {
    //   case WaiterState.SUCCESS: {
    //     core.debug(waitResult.reason);
    //     return;
    //   }
    //   default: {
    //     core.setFailed(waitResult.reason);
    //     return;
    //   }
    // }
  }

  static async renameSignedObject(): Promise<void> {
    return;
  }
}
