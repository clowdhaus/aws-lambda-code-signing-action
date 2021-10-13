# AWS Lambda Code Signing Infrastructure

Configurations in this directory creates resources to support testing, validating, as well as an example base for supporting the `clowdhaus/aws-lambda-code-signing-action`.

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
| <a name="provider_aws"></a> [aws](#provider\_aws) | >= 3.17 |

## Modules

No modules.

## Resources

| Name | Type |
|------|------|
| [aws_lambda_code_signing_config.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_code_signing_config) | resource |
| [aws_signer_signing_profile.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/signer_signing_profile) | resource |
| [aws_signer_signing_profile_permission.sp_permission_1](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/signer_signing_profile_permission) | resource |
| [aws_signer_signing_profile_permission.sp_permission_2](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/signer_signing_profile_permission) | resource |
| [aws_signer_signing_profile_permission.sp_permission_3](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/signer_signing_profile_permission) | resource |

## Inputs

No inputs.

## Outputs

No outputs.
<!-- END OF PRE-COMMIT-TERRAFORM DOCS HOOK -->

## License

Apache-2.0 Licensed. See [LICENSE](../LICENSE).
