<p align="center">
  <img src=".github/aws-lambda-code-signing.png" alt="AWS Lambda Code Signing" width="50%">
</p>
<h1 style="font-size: 56px; margin: 0; padding: 0;" align="center">
  aws-lambda-code-signing-action
</h1>
<p align="center">
  <img src="https://badgen.net/badge/TypeScript/strict%20%F0%9F%92%AA/blue" alt="Strict TypeScript">
  <a href="http://commitizen.github.io/cz-cli/" alt="commitizen cli">
    <img src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg" alt="Commitizen friendly">
  </a>
  <a href="https://snyk.io/test/github/clowdhaus/aws-lambda-code-signing-action">
    <img src="https://snyk.io/test/github/clowdhaus/aws-lambda-code-signing-action/badge.svg" alt="Known Vulnerabilities" data-canonical-src="https://snyk.io/test/github/clowdhaus/aws-lambda-code-signing-action">
  </a>
</p>
<p align="center">
  <a href="https://github.com/clowdhaus/aws-lambda-code-signing-action/actions?query=workflow%3Aintegration">
    <img src="https://github.com/clowdhaus/aws-lambda-code-signing-action/workflows/integration/badge.svg" alt="integration test">
  </a>
</p>

GitHub action which uses AWS Code Signer to sign ✍🏼 AWS Lambda artifacts 📦

| Functionality                                                                 | Status |
| ----------------------------------------------------------------------------- | :----: |
| Create AWS Signer signing request for existing object in source AWS S3 bucket |   ✅   |
| Wait for signing job to complete                                              |   ✅   |
| Rename signed object to original/friendly name under destination prefix       |   ✅   |
| Copy tags from original object to signed object                               |        |
| Upload local artifact from CI pipeline to AWS S3 source bucket                |        |
| Generate zip archive for upload to AWS S3 source bucket                       |        |

## Usage

See the [AWS documentation](https://docs.aws.amazon.com/lambda/latest/dg/configuration-codesigning.html) for more details related to code signing AWS Lambda artifacts.

ℹ️ The artifact must already exist in AWS S3 in order for the action to initiate a signing job request; the action does not handle uploading a local artifact to AWS S3 (at this time) before initiating a signing job request.

### Sign

The following is an example of creating a signing job and retrieving the resulting `jobId`.

```yml
jobs:
  deploy:
    name: Upload to Amazon S3
    runs-on: ubuntu-latest
    steps:
      - name: Sign AWS Lambda artifact
        uses: clowdhaus/aws-lambda-code-signing-action/@main
        id: signed
        with:
          aws-region: us-east-1
          source-s3-bucket: source-s3-bucket-us-east-1
          source-s3-key: unsigned/dist.zip
          source-s3-version: xtmNOx66ZujPT5G.ihF6p60zz8hF5YAK
          destination-s3-bucket: destination-s3-bucket-us-east-1 # can re-use same bucket
          destination-s3-prefix: signed/
          profile-name: AwsLambdaCodeSigningAction20211013170708789000654321

      - name: Outputs
        run: |
          echo "${{ steps.signed.outputs.job-id }}"
          echo "${{ steps.signed.outputs.signed-object-key }}"
```

### Sign & Wait

```yml
jobs:
  deploy:
    name: Upload to Amazon S3
    runs-on: ubuntu-latest
    steps:
      - name: Sign AWS Lambda artifact
        uses: clowdhaus/aws-lambda-code-signing-action/@main
        with:
          aws-region: us-east-1
          source-s3-bucket: source-s3-bucket-us-east-1
          source-s3-key: unsigned/dist.zip
          source-s3-version: xtmNOx66ZujPT5G.ihF6p60zz8hF5YAK
          destination-s3-bucket: destination-s3-bucket-us-east-1 # can re-use same bucket
          destination-s3-prefix: signed/
          profile-name: AwsLambdaCodeSigningAction20211013170708789000654321
          wait-until-successful: true
          max-wait-time: 60
```

### Sign & Rename

The following configuration will create a signing job, wait for the job to finish, and then rename the signed object from the AWS Signer output of `<job-id>.<source-file-extension>` to `<destination-s3-prefix>/<source-file-name-and-extension>`. Given the configuration below, there would be two signed artifacts created:

1. `<job-id>.zip` created by the AWS Signer job
2. `signed/dist.zip` created by the action (using `rename-signed-object: true`)

Because the job must complete successfully before the signed object can be renamed, `wait-until-successful` is not required but it will be treated as though its `true`. Therefore, you can also set the amount of wait time when renaming to give the job more time if necessary.

```yml
jobs:
  deploy:
    name: Upload to Amazon S3
    runs-on: ubuntu-latest
    steps:
      - name: Sign AWS Lambda artifact & rename signed artifact
        uses: clowdhaus/aws-lambda-code-signing-action/@main
        id: signed
        with:
          aws-region: us-east-1
          source-s3-bucket: source-s3-bucket-us-east-1
          source-s3-key: unsigned/dist.zip
          source-s3-version: xtmNOx66ZujPT5G.ihF6p60zz8hF5YAK
          destination-s3-bucket: destination-s3-bucket-us-east-1 # can re-use same bucket
          destination-s3-prefix: signed/
          profile-name: AwsLambdaCodeSigningAction20211013170708789000654321
          max-wait-time: 60
          rename-signed-object: true

      - name: Outputs
        run: |
          echo "${{ steps.signed.outputs.job-id }}"
          echo "${{ steps.signed.outputs.renamed-signed-object-key }}"
```

## AWS Signing Resources

See the [`__infra__`](__infra__) directory for example of resource definitions necessary for signing.

## Getting Started

The following instructions will help you get setup for development and testing purposes.

### Prerequisites

#### [yarn](https://github.com/yarnpkg/yarn)

`yarn` is used to handle dependencies and executing scripts on the codebase.

See [here](https://yarnpkg.com/en/docs/install#debian-stable) for instructions on installing yarn on your local machine.

Once you have installed `yarn`, you can install the project dependencies by running the following command from within the project root directory:

```bash
  $ yarn
```

## Contributing

Please read [CODE_OF_CONDUCT.md](.github/CODE_OF_CONDUCT.md) for details on our code of conduct and the process for submitting pull requests.

## Changelog

Please see the [CHANGELOG.md](CHANGELOG.md) for details on individual releases.
