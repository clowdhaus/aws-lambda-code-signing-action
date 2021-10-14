/**
 * Parse action input into a some proper thing.
 */

import * as core from '@actions/core';
import {StartSigningJobCommandInput} from '@aws-sdk/client-signer';

export interface Input {
  awsRegion: string;
  clientRequestToken?: string;
  jobCommandInput: StartSigningJobCommandInput;
  renameSignedObject: boolean;
  waitUntilSuccessful: boolean;
  maxWaitTime: number;
}

// Helper function since only strings are used as inputs
function convertToBoolean(input: string): boolean {
  return input.toLowerCase() === 'true';
}

export function get(): Input | undefined {
  try {
    const awsRegion = core.getInput('aws-region', {required: true});
    const clientRequestToken = core.getInput('client-request-token', {required: false});
    const sourceS3Bucket = core.getInput('source-s3-bucket', {required: true});
    const sourceS3Key = core.getInput('source-s3-key', {required: true});
    const sourceS3Version = core.getInput('source-s3-version', {required: true});
    const destinationS3Bucket = core.getInput('destination-s3-bucket', {required: true});
    const destinationS3Prefix = core.getInput('destination-s3-prefix', {required: true});
    const profileName = core.getInput('profile-name', {required: false});
    const profileOwner = core.getInput('profile-owner', {required: false});

    const renameSignedObject = convertToBoolean(core.getInput('rename-signed-object', {required: false}));
    const waitUntilSuccessful = convertToBoolean(core.getInput('wait-until-successful', {required: false}));
    const maxWaitTime = parseInt(core.getInput('max-wait-time', {required: false}));

    const jobCommandInput: StartSigningJobCommandInput = {
      source: {
        s3: {
          bucketName: sourceS3Bucket,
          key: sourceS3Key,
          version: sourceS3Version,
        },
      },
      destination: {
        s3: {
          bucketName: destinationS3Bucket,
          prefix: destinationS3Prefix,
        },
      },
      profileName: profileName,
      ...(profileOwner ? {profileName: profileName} : {}),
    };

    return {
      awsRegion,
      clientRequestToken,
      jobCommandInput,
      renameSignedObject,
      waitUntilSuccessful,
      maxWaitTime,
    };
  } catch (error) {
    core.setFailed((<Error>error).message);
    return;
  }
}
