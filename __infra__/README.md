# AWS Lambda Code Signing Infrastructure

Configurations in this directory creates resources to support testing, validating, as well as an example base for supporting the `clowdhaus/aws-lambda-code-signing-action`:
- AWS Lambda code signing config
- AWS Signer signing profile
- Signing profile permissions for signer
- IAM role which is authorized to perform signing (as well as carry out functionality defined with this action - wait for successful job completion, rename signed object, etc.)
- Supporting resources:
  - IAM user to authenticate action workflow to AWS and assume IAM role for signing
  - S3 bucket and object for demonstrating signing (bucket is used as both source and destination)

## Usage

To provision, execute the following:

```bash
$ terraform init
$ terraform plan
$ terraform apply
```

<!-- BEGINNING OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_terraform"></a> [terraform](#requirement\_terraform) | ~> 1.0 |
| <a name="requirement_aws"></a> [aws](#requirement\_aws) | >= 3.17 |

## Providers

| Name | Version |
|------|---------|
| <a name="provider_archive"></a> [archive](#provider\_archive) | n/a |
| <a name="provider_aws"></a> [aws](#provider\_aws) | >= 3.17 |

## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_signing_test_bucket"></a> [signing\_test\_bucket](#module\_signing\_test\_bucket) | terraform-aws-modules/s3-bucket/aws | ~> 2.10 |

## Resources

| Name | Type |
|------|------|
| [aws_iam_role.signer](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role) | resource |
| [aws_iam_role_policy.signer](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy) | resource |
| [aws_lambda_code_signing_config.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_code_signing_config) | resource |
| [aws_s3_bucket_object.test](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket_object) | resource |
| [aws_signer_signing_profile.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/signer_signing_profile) | resource |
| [aws_signer_signing_profile_permission.signer_role_get_signing_profile](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/signer_signing_profile_permission) | resource |
| [aws_signer_signing_profile_permission.signer_role_start_signing_job](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/signer_signing_profile_permission) | resource |
| [archive_file.test](https://registry.terraform.io/providers/hashicorp/archive/latest/docs/data-sources/file) | data source |
| [aws_caller_identity.current](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/caller_identity) | data source |
| [aws_iam_policy_document.signer](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/iam_policy_document) | data source |
| [aws_iam_policy_document.signer_assume](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/iam_policy_document) | data source |
| [aws_region.current](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/region) | data source |
| [aws_ssm_parameter.github_oidc_id](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/ssm_parameter) | data source |

## Inputs

No inputs.

## Outputs

No outputs.
<!-- END OF PRE-COMMIT-TERRAFORM DOCS HOOK -->

## License

Apache-2.0 Licensed. See [LICENSE](../LICENSE).
