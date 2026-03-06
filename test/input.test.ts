import {describe, it, expect, vi, beforeEach} from 'vitest';
import * as core from '@actions/core';
import {get} from '../src/input';

vi.mock('@actions/core');

describe('input', () => {
  const mockInputs: Record<string, string> = {
    'aws-region': 'us-east-1',
    'client-request-token': '',
    'source-s3-bucket': 'my-source-bucket',
    'source-s3-key': 'unsigned/dist.zip',
    'source-s3-version': 'abc123',
    'destination-s3-bucket': 'my-dest-bucket',
    'destination-s3-prefix': 'signed/',
    'profile-name': 'my-profile',
    'profile-owner': '',
    'rename-signed-object': 'true',
    'wait-until-successful': 'true',
    'max-wait-time': '30',
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(core.getInput).mockImplementation((name: string) => mockInputs[name] ?? '');
  });

  it('should parse all required inputs', () => {
    const result = get();

    expect(result.awsRegion).toBe('us-east-1');
    expect(result.source.bucketName).toBe('my-source-bucket');
    expect(result.source.key).toBe('unsigned/dist.zip');
    expect(result.source.version).toBe('abc123');
    expect(result.destination.bucketName).toBe('my-dest-bucket');
    expect(result.destination.prefix).toBe('signed/');
    expect(result.renameSignedObject).toBe(true);
    expect(result.waitUntilSuccessful).toBe(true);
    expect(result.maxWaitTime).toBe(30);
  });

  it('should mark bucket names as secrets', () => {
    get();

    expect(core.setSecret).toHaveBeenCalledWith('my-source-bucket');
    expect(core.setSecret).toHaveBeenCalledWith('my-dest-bucket');
  });

  it('should mark client request token as secret when provided', () => {
    mockInputs['client-request-token'] = 'my-token';
    get();

    expect(core.setSecret).toHaveBeenCalledWith('my-token');
  });

  it('should not mark empty client request token as secret', () => {
    mockInputs['client-request-token'] = '';
    get();

    const calls = vi.mocked(core.setSecret).mock.calls.map(c => c[0]);
    expect(calls).not.toContain('');
  });

  it('should mark profile name as secret when provided', () => {
    mockInputs['profile-name'] = 'my-profile';
    get();

    expect(core.setSecret).toHaveBeenCalledWith('my-profile');
  });

  it('should mark profile owner as secret when provided', () => {
    mockInputs['profile-owner'] = '123456789012';
    get();

    expect(core.setSecret).toHaveBeenCalledWith('123456789012');
  });

  it('should include profileOwner in job command input when provided', () => {
    mockInputs['profile-owner'] = '123456789012';
    const result = get();

    expect(result.jobCommandInput.profileOwner).toBe('123456789012');
  });

  it('should not include profileOwner when empty', () => {
    mockInputs['profile-owner'] = '';
    const result = get();

    expect(result.jobCommandInput.profileOwner).toBeUndefined();
  });

  it('should convert rename-signed-object to boolean', () => {
    mockInputs['rename-signed-object'] = 'false';
    const result = get();

    expect(result.renameSignedObject).toBe(false);
  });

  it('should convert wait-until-successful to boolean', () => {
    mockInputs['wait-until-successful'] = 'false';
    const result = get();

    expect(result.waitUntilSuccessful).toBe(false);
  });

  it('should construct correct job command input', () => {
    const result = get();

    expect(result.jobCommandInput.source).toEqual({s3: {bucketName: 'my-source-bucket', key: 'unsigned/dist.zip', version: 'abc123'}});
    expect(result.jobCommandInput.destination).toEqual({s3: {bucketName: 'my-dest-bucket', prefix: 'signed/'}});
    expect(result.jobCommandInput.profileName).toBe('my-profile');
  });

  it('should include clientRequestToken in job command input when provided', () => {
    mockInputs['client-request-token'] = 'idempotency-token';
    const result = get();

    expect(result.jobCommandInput.clientRequestToken).toBe('idempotency-token');
  });

  it('should not include clientRequestToken when empty', () => {
    mockInputs['client-request-token'] = '';
    const result = get();

    expect(result.jobCommandInput.clientRequestToken).toBeUndefined();
  });

  it('should parse max-wait-time as base-10 integer', () => {
    mockInputs['max-wait-time'] = '060';
    const result = get();

    expect(result.maxWaitTime).toBe(60);
  });
});
