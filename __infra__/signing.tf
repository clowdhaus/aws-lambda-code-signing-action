################################################################################
# Signer IAM role
# Used within the CI/CD process - i.e. used by this action in a workflow
################################################################################

data "aws_ssm_parameter" "github_oidc_id" {
  name = "/iam/github-oidc-provider-id"
}

data "aws_iam_policy_document" "signer_assume" {
  statement {
    sid    = "GithubOidcAuth"
    effect = "Allow"
    actions = [
      "sts:TagSession",
      "sts:AssumeRoleWithWebIdentity"
    ]

    principals {
      type        = "Federated"
      identifiers = [data.aws_ssm_parameter.github_oidc_id.value]
    }

    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:clowdhaus/${local.name}:*"]
    }

    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "signer" {
  name                  = "${local.name}-signer"
  description           = "IAM role used for signing Lambda artifacts"
  assume_role_policy    = data.aws_iam_policy_document.signer_assume.json
  force_detach_policies = true

  tags = local.tags
}

data "aws_iam_policy_document" "signer" {
  statement {
    sid = "S3List"
    actions = [
      "s3:GetObject*",
      "s3:PutObject",
      "s3:ListBucket",
      "s3:ListBucketVersions",
    ]
    resources = [
      module.signing_test_bucket.s3_bucket_arn,
      "${module.signing_test_bucket.s3_bucket_arn}/*",
    ]
  }

  statement {
    sid = "Sign"
    actions = [
      "signer:GetSigningProfile",
      "signer:StartSigningJob",
    ]
    resources = [aws_signer_signing_profile.this.arn]
  }

  # Required for waiting on job to finish successfully
  statement {
    sid = "CheckJobStatus"
    actions = [
      "signer:DescribeSigningJob",
      "signer:ListSigningJobs",
    ]
    resources = ["arn:aws:signer:${local.region}:${local.account_id}:/signing-jobs/*"]
  }
}

resource "aws_iam_role_policy" "signer" {
  name   = "${local.name}-signer"
  role   = aws_iam_role.signer.id
  policy = data.aws_iam_policy_document.signer.json
}

################################################################################
# Signing Config + Profile + Permissions
################################################################################

resource "aws_lambda_code_signing_config" "this" {
  description = "Code signing config for `${local.name}`"

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
  version = "~> 2.10"

  bucket = "${local.name}-${local.account_id}-${local.region}"
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

  # TODO - update action to copy over tags for original artifact
  # AWS Signer does not carry over object tags onto signed object
  tags = local.tags
}
