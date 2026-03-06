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
  private jobId!: string;

  constructor(region: string) {
    this.region = region;
    this.client = new SignerClient({region});
  }

  async createSignedJob(commandInput: StartSigningJobCommandInput): Promise<StartSigningJobResponse> {
    const command = new StartSigningJobCommand(commandInput);
    const destinationPrefix = commandInput.destination?.s3?.prefix;
    const sourceFileExtension = path.extname(path.basename(commandInput.source?.s3?.key || ''));

    const response = await this.client.send(command);

    if (!response.jobId) {
      throw new Error(`jobId not found on StartSigningJobResponse: ${JSON.stringify(response)}`);
    }

    core.setOutput('job-id', response.jobId);
    core.setOutput('signed-object-key', `${destinationPrefix}${response.jobId}${sourceFileExtension}`);
    this.jobId = response.jobId;
    return response;
  }

  async waitUntilSuccessful(maxWaitTime: number): Promise<void> {
    const waiterConfig = {client: this.client, minDelay: 1, maxDelay: 10, maxWaitTime};
    const signingJobInput = {jobId: this.jobId};

    const waitResult = await waitUntilSuccessfulSigningJob(waiterConfig, signingJobInput);
    core.debug(`waitResult: ${JSON.stringify(waitResult, null, 4)}`);
  }

  async renameSignedObject(source: input.Source, destination: input.Destination): Promise<CopyObjectCommandOutput> {
    const s3Client = new S3Client({region: this.region});

    const sourceObject = path.basename(source.key);
    const sourceObjectExtension = path.extname(sourceObject);

    // no `/` between <prefix> & <jobId> because its all specified by user in <prefix>
    // <sourceObjectExtension> required to re-add to signed object created, we only get a <jobId> unfortunately
    const sourceKey = `${destination.bucketName}/${destination.prefix}${this.jobId}${sourceObjectExtension}`;
    const renamedKey = `${destination.prefix}${sourceObject}`;

    const commandInput: CopyObjectCommandInput = {
      Bucket: destination.bucketName,
      CopySource: sourceKey,
      Key: renamedKey,
    };

    const command = new CopyObjectCommand(commandInput);
    const result = await s3Client.send(command);
    core.setOutput('renamed-signed-object-key', renamedKey);
    return result;
  }
}
