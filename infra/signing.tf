################################################################################
# Signing Config + Profile + Permissions
################################################################################

resource "aws_lambda_code_signing_config" "this" {
  description = "Code signing config for `${local.project}`"

  allowed_publishers {
    signing_profile_version_arns = [
      aws_signer_signing_profile.this.arn,
    ]
  }

  policies {
    untrusted_artifact_on_deployment = "Enforce"
  }
}

resource "aws_signer_signing_profile" "this" {
  name_prefix = "AwsLambdaCodeSigningAction"
  platform_id = "AWSLambda-SHA384-ECDSA"

  signature_validity_period {
    value = 5
    type  = "YEARS"
  }

  tags = local.tags
}

resource "aws_signer_signing_profile_permission" "signer_role_get_signing_profile" {
  profile_name = aws_signer_signing_profile.this.name
  action       = "signer:GetSigningProfile"
  principal    = aws_iam_role.signer.arn
  statement_id = "SignerRole_GetSigningProfile"
}

resource "aws_signer_signing_profile_permission" "signer_role_start_signing_job" {
  profile_name = aws_signer_signing_profile.this.name
  action       = "signer:StartSigningJob"
  principal    = aws_iam_role.signer.arn
  statement_id = "SignerRole_StartSigningJob"
}

################################################################################
# Test S3 Bucket and Zip Archive
################################################################################

module "signing_test_bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "~> 2.9"

  bucket = "${local.project}-${local.account_id}-${local.region}"
  acl    = "private"

  attach_deny_insecure_transport_policy = true

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true

  versioning = {
    enabled = true
  }

  server_side_encryption_configuration = {
    rule = {
      apply_server_side_encryption_by_default = {
        sse_algorithm = "AES256"
      }
    }
  }

  tags = local.tags
}

data "archive_file" "test" {
  type        = "zip"
  source_dir  = "../dist"
  output_path = "dist.zip"
}

resource "aws_s3_bucket_object" "test" {
  bucket = module.signing_test_bucket.s3_bucket_id
  key    = "unsigned/${data.archive_file.test.output_path}"
  source = data.archive_file.test.output_path
}
