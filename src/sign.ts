/**
 * AWS Signer w/ ability to rename signed object
 */

import * as input from './input';

import * as core from '@actions/core';
import {S3Client, CopyObjectCommand, CopyObjectCommandInput, CopyObjectCommandOutput} from '@aws-sdk/client-s3';
import {
  SignerClient,
  StartSigningJobCommand,
  StartSigningJobCommandInput,
  StartSigningJobResponse,
  waitUntilSuccessfulSigningJob,
} from '@aws-sdk/client-signer';

import * as path from 'path';

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

      const destinationPrefix = input.destination?.s3?.prefix;
      const sourceFileExtension = path.extname(path.basename(input.source?.s3?.key || ''));

      if (response.jobId) {
        core.setOutput('job-id', response.jobId);
        core.setOutput('signed-object-key', `${destinationPrefix}${response.jobId}${sourceFileExtension}`);
        this.jobId = response.jobId;
        return response; // currently not utilized elsewhere
      }

      // Without `jobId` we cannot (should not) continue
      core.setFailed(JSON.stringify(response, null, 4));
      throw '`jobId` not found on `StartSigningJobResponse`';
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

    // no `/` between <prefix> & <jobId> because its all specified by user in <prefix>
    // <sourceObjectExtension> required to re-add to signed object created, we only get a <jobId> unfortunately
    const sourceKey = `${destination.bucketName}/${destination.prefix}${this.jobId}${sourceObjectExtension}`;
    const renamedKey = `${destination.prefix}${sourceObject}`;

    const input: CopyObjectCommandInput = {
      Bucket: destination.bucketName,
      CopySource: sourceKey,
      Key: renamedKey,
    };

    const command = new CopyObjectCommand(input);

    try {
      const result = await s3Client.send(command);
      core.setOutput('renamed-signed-object-key', renamedKey);
      return result;
    } catch (error) {
      core.setFailed(JSON.stringify(error, null, 4));
      throw error;
    }
  }
}
