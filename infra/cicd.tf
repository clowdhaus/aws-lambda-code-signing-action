################################################################################
# CI/CD IAM user - waiting for GitHub OIDC integration to stabilize
################################################################################

resource "aws_iam_user" "cicd" {
  name = local.project
  path = "/cicd/"
  tags = local.tags
}

data "aws_iam_policy_document" "cicd" {
  statement {
    sid = "AssumeSignerRole"

    actions = [
      "sts:AssumeRole"
    ]

    resources = [
      aws_iam_role.signer.arn
    ]
  }
}

resource "aws_iam_user_policy" "cicd" {
  name   = local.project
  user   = aws_iam_user.cicd.name
  policy = data.aws_iam_policy_document.cicd.json
}

################################################################################
# Signer IAM role
################################################################################

data "aws_iam_policy_document" "signer_assume" {
  statement {
    sid = "AssumeRole"

    actions = [
      "sts:AssumeRole",
      "sts:TagSession",
    ]

    principals {
      type        = "AWS"
      identifiers = [aws_iam_user.cicd.arn]
    }
  }
}

resource "aws_iam_role" "signer" {
  name                  = "${local.project}-signer"
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

  # Required for waiting for job
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
  name   = "${local.project}-signer"
  role   = aws_iam_role.signer.id
  policy = data.aws_iam_policy_document.signer.json
}
