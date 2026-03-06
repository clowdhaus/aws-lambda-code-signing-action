import {describe, it, expect, vi, beforeEach} from 'vitest';
import * as core from '@actions/core';
import * as input from '../src/input';

vi.mock('@actions/core');
vi.mock('../src/input');

const {mockCreateSignedJob, mockWaitUntilSuccessful, mockRenameSignedObject} = vi.hoisted(() => ({
  mockCreateSignedJob: vi.fn(),
  mockWaitUntilSuccessful: vi.fn(),
  mockRenameSignedObject: vi.fn(),
}));

vi.mock('../src/sign', () => ({
  default: class {
    createSignedJob = mockCreateSignedJob;
    waitUntilSuccessful = mockWaitUntilSuccessful;
    renameSignedObject = mockRenameSignedObject;
  },
}));

const baseInput: input.Input = {
  awsRegion: 'us-east-1',
  source: {bucketName: 'src-bucket', key: 'unsigned/dist.zip', version: 'v1'},
  destination: {bucketName: 'dst-bucket', prefix: 'signed/'},
  jobCommandInput: {
    source: {s3: {bucketName: 'src-bucket', key: 'unsigned/dist.zip', version: 'v1'}},
    destination: {s3: {bucketName: 'dst-bucket', prefix: 'signed/'}},
    profileName: 'my-profile',
  },
  renameSignedObject: true,
  waitUntilSuccessful: true,
  maxWaitTime: 30,
};

// Import main directly so we can await it — no setTimeout race conditions
import {main} from '../src/index';

describe('index', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateSignedJob.mockResolvedValue({jobId: 'job-1'});
    mockWaitUntilSuccessful.mockResolvedValue(undefined);
    mockRenameSignedObject.mockResolvedValue({CopyObjectResult: {}});
  });

  it('should run the full signing flow', async () => {
    vi.mocked(input.get).mockReturnValue(baseInput);

    await main();

    expect(mockCreateSignedJob).toHaveBeenCalledWith(baseInput.jobCommandInput);
    expect(mockWaitUntilSuccessful).toHaveBeenCalledWith(30);
    expect(mockRenameSignedObject).toHaveBeenCalledWith(baseInput.source, baseInput.destination);
  });

  it('should skip wait and rename when both are false', async () => {
    vi.mocked(input.get).mockReturnValue({
      ...baseInput,
      waitUntilSuccessful: false,
      renameSignedObject: false,
    });

    await main();

    expect(mockCreateSignedJob).toHaveBeenCalled();
    expect(mockWaitUntilSuccessful).not.toHaveBeenCalled();
    expect(mockRenameSignedObject).not.toHaveBeenCalled();
  });

  it('should wait but not rename when only wait is true', async () => {
    vi.mocked(input.get).mockReturnValue({
      ...baseInput,
      waitUntilSuccessful: true,
      renameSignedObject: false,
    });

    await main();

    expect(mockWaitUntilSuccessful).toHaveBeenCalledWith(30);
    expect(mockRenameSignedObject).not.toHaveBeenCalled();
  });

  it('should wait and rename when only rename is true', async () => {
    vi.mocked(input.get).mockReturnValue({
      ...baseInput,
      waitUntilSuccessful: false,
      renameSignedObject: true,
    });

    await main();

    expect(mockWaitUntilSuccessful).toHaveBeenCalledWith(30);
    expect(mockRenameSignedObject).toHaveBeenCalled();
  });

  it('should call setFailed on error', async () => {
    vi.mocked(input.get).mockImplementation(() => {
      throw new Error('bad input');
    });

    await main();

    expect(core.setFailed).toHaveBeenCalledWith('bad input');
  });

  it('should handle non-Error throws', async () => {
    vi.mocked(input.get).mockImplementation(() => {
      throw 'string error';
    });

    await main();

    expect(core.setFailed).toHaveBeenCalledWith('string error');
  });
});
