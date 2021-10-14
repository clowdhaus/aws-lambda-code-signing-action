/**
 * Parse action input into a some proper thing.
 */

import * as core from '@actions/core';
import {StartSigningJobCommandInput} from '@aws-sdk/client-signer';

// S3 source
export interface Source {
  bucketName: string;
  key: string;
  version: string;
}

// S3 destination
export interface Destination {
  bucketName: string;
  prefix: string;
}

export interface Input {
  awsRegion: string;
  clientRequestToken?: string;
  source: Source;
  destination: Destination;
  jobCommandInput: StartSigningJobCommandInput;
  renameSignedObject: boolean;
  waitUntilSuccessful: boolean;
  maxWaitTime: number;
}

// Helper function since only strings are used as inputs
function convertToBoolean(input: string): boolean {
  return input.toLowerCase() === 'true';
}

// Handles all input validation and type coercion, providing back a "usable" `Input` object
export function get(): Input {
  try {
    const awsRegion = core.getInput('aws-region', {required: true});
    const clientRequestToken = core.getInput('client-request-token', {required: false});
    if (clientRequestToken) core.setSecret(clientRequestToken);

    const sourceS3Bucket = core.getInput('source-s3-bucket', {required: true});
    core.setSecret(sourceS3Bucket);

    const sourceS3Key = core.getInput('source-s3-key', {required: true});
    const sourceS3Version = core.getInput('source-s3-version', {required: true});

    const destinationS3Bucket = core.getInput('destination-s3-bucket', {required: true});
    core.setSecret(destinationS3Bucket);

    const destinationS3Prefix = core.getInput('destination-s3-prefix', {required: true});

    const profileName = core.getInput('profile-name', {required: false});
    if (profileName) core.setSecret(profileName);

    const profileOwner = core.getInput('profile-owner', {required: false});
    if (profileOwner) core.setSecret(profileOwner);

    const renameSignedObject = convertToBoolean(core.getInput('rename-signed-object', {required: false}));
    const waitUntilSuccessful = convertToBoolean(core.getInput('wait-until-successful', {required: false}));
    const maxWaitTime = parseInt(core.getInput('max-wait-time', {required: false}));

    // S3 source - used in both the signing job and renaming
    const source: Source = {
      bucketName: sourceS3Bucket,
      key: sourceS3Key,
      version: sourceS3Version,
    };

    // S3 destination - used in both signing job and renaming
    const destination: Destination = {
      bucketName: destinationS3Bucket,
      prefix: destinationS3Prefix,
    };

    // Object provided as input to the signing job
    const jobCommandInput: StartSigningJobCommandInput = {
      source: {s3: source},
      destination: {s3: destination},
      profileName: profileName,
      ...(profileOwner ? {profileName: profileName} : {}),
    };

    return {
      awsRegion,
      clientRequestToken,
      source,
      destination,
      jobCommandInput,
      renameSignedObject,
      waitUntilSuccessful,
      maxWaitTime,
    };
  } catch (error) {
    core.setFailed((<Error>error).message);
    throw error;
  }
}
