import {describe, it, expect, vi, beforeEach} from 'vitest';
import * as core from '@actions/core';

vi.mock('@actions/core');

const {mockSignerSend, mockS3Send, mockWaitUntilSuccessfulSigningJob} = vi.hoisted(() => ({
  mockSignerSend: vi.fn(),
  mockS3Send: vi.fn(),
  mockWaitUntilSuccessfulSigningJob: vi.fn(),
}));

vi.mock('@aws-sdk/client-signer', () => ({
  SignerClient: class { send = mockSignerSend; },
  StartSigningJobCommand: class {},
  waitUntilSuccessfulSigningJob: mockWaitUntilSuccessfulSigningJob,
}));

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: class { send = mockS3Send; },
  CopyObjectCommand: class {},
}));

import CodeSigner from '../src/sign';

describe('CodeSigner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create a signer with the given region', () => {
      const signer = new CodeSigner('us-east-1');
      expect(signer.region).toBe('us-east-1');
      expect(signer.client).toBeDefined();
    });
  });

  describe('createSignedJob', () => {
    it('should throw when jobId is missing from response', async () => {
      mockSignerSend.mockResolvedValue({});
      const signer = new CodeSigner('us-east-1');

      await expect(signer.createSignedJob({
        source: {s3: {bucketName: 'bucket', key: 'test.zip', version: 'v1'}},
        destination: {s3: {bucketName: 'dest', prefix: 'signed/'}},
        profileName: 'profile',
      })).rejects.toThrow('jobId not found');
    });

    it('should set outputs when jobId is present', async () => {
      mockSignerSend.mockResolvedValue({jobId: 'job-123'});
      const signer = new CodeSigner('us-east-1');

      await signer.createSignedJob({
        source: {s3: {bucketName: 'bucket', key: 'unsigned/dist.zip', version: 'v1'}},
        destination: {s3: {bucketName: 'dest', prefix: 'signed/'}},
        profileName: 'profile',
      });

      expect(core.setOutput).toHaveBeenCalledWith('job-id', 'job-123');
      expect(core.setOutput).toHaveBeenCalledWith('signed-object-key', 'signed/job-123.zip');
    });

    it('should handle source key without extension', async () => {
      mockSignerSend.mockResolvedValue({jobId: 'job-456'});
      const signer = new CodeSigner('us-east-1');

      await signer.createSignedJob({
        source: {s3: {bucketName: 'bucket', key: 'unsigned/artifact', version: 'v1'}},
        destination: {s3: {bucketName: 'dest', prefix: 'signed/'}},
        profileName: 'profile',
      });

      expect(core.setOutput).toHaveBeenCalledWith('signed-object-key', 'signed/job-456');
    });
  });

  describe('waitUntilSuccessful', () => {
    it('should call waitUntilSuccessfulSigningJob with correct params', async () => {
      mockSignerSend.mockResolvedValue({jobId: 'job-789'});
      mockWaitUntilSuccessfulSigningJob.mockResolvedValue({state: 'SUCCESS'});

      const signer = new CodeSigner('us-east-1');
      await signer.createSignedJob({
        source: {s3: {bucketName: 'b', key: 'k.zip', version: 'v'}},
        destination: {s3: {bucketName: 'd', prefix: 'p/'}},
        profileName: 'prof',
      });

      await signer.waitUntilSuccessful(60);

      expect(mockWaitUntilSuccessfulSigningJob).toHaveBeenCalledWith(
        expect.objectContaining({minDelay: 1, maxDelay: 10, maxWaitTime: 60}),
        {jobId: 'job-789'},
      );
    });
  });

  describe('renameSignedObject', () => {
    it('should copy object with correct key and set output', async () => {
      mockSignerSend.mockResolvedValue({jobId: 'job-abc'});
      mockS3Send.mockResolvedValue({CopyObjectResult: {}});

      const signer = new CodeSigner('us-east-1');
      await signer.createSignedJob({
        source: {s3: {bucketName: 'b', key: 'unsigned/dist.zip', version: 'v'}},
        destination: {s3: {bucketName: 'd', prefix: 'signed/'}},
        profileName: 'prof',
      });

      const result = await signer.renameSignedObject(
        {bucketName: 'b', key: 'unsigned/dist.zip', version: 'v'},
        {bucketName: 'd', prefix: 'signed/'},
      );

      expect(result).toEqual({CopyObjectResult: {}});
      expect(core.setOutput).toHaveBeenCalledWith('renamed-signed-object-key', 'signed/dist.zip');
    });
  });
});
