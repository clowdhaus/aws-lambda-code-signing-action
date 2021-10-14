import * as path from 'path';

import {
  SignerClient,
  StartSigningJobCommand,
  StartSigningJobCommandInput,
  StartSigningJobResponse,
  waitUntilSuccessfulSigningJob,
} from '@aws-sdk/client-signer';
import {S3Client, CopyObjectCommand, CopyObjectCommandInput, CopyObjectCommandOutput} from '@aws-sdk/client-s3';

import * as core from '@actions/core';

import * as input from './input';

export default class CodeSigner {
  readonly region: string;
  readonly client: SignerClient;
  private jobId: string;

  constructor(region: string) {
    this.region = region;
    this.client = new SignerClient({region});
  }

  async createSignedJob(input: StartSigningJobCommandInput): Promise<StartSigningJobResponse> {
    try {
      const command = new StartSigningJobCommand(input);
      const response = await this.client.send(command);
      if (response.jobId) {
        core.setOutput('jobId', response.jobId);
        this.jobId = response.jobId;
      }
      return response;
    } catch (error) {
      core.setFailed(JSON.stringify(error, null, 4));
      throw error;
    }
  }

  async waitUntilSuccessful(maxWaitTime: number): Promise<void> {
    const waiterConfig = {client: this.client, minDelay: 1, maxDelay: 10, maxWaitTime};
    const signingJobInput = {jobId: this.jobId};

    try {
      const waitResult = await waitUntilSuccessfulSigningJob(waiterConfig, signingJobInput);
      core.debug(`waitResult: ${JSON.stringify(waitResult, null, 4)}`);
    } catch (error) {
      core.setFailed(JSON.stringify(error, null, 4));
    }
  }

  async renameSignedObject(source: input.Source, destination: input.Destination): Promise<CopyObjectCommandOutput> {
    const s3Client = new S3Client({region: this.region});

    const sourceObject = path.basename(source.key);
    const sourceObjectExtension = path.extname(sourceObject);

    const input: CopyObjectCommandInput = {
      Bucket: destination.bucketName,
      // no `/` between <prefix> & <jobId> because its all specified by user in <prefix>
      // <sourceObjectExtension> required to re-add to signed object created, we only get a <jobId> unfortunately
      CopySource: `${destination.bucketName}/${destination.prefix}${this.jobId}${sourceObjectExtension}`,
      Key: `${destination.prefix}${sourceObject}`,
    };

    const command = new CopyObjectCommand(input);

    try {
      return await s3Client.send(command);
    } catch (error) {
      core.setFailed(JSON.stringify(error, null, 4));
      throw error;
    }
  }
}
