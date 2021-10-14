################################################################################
# CI/CD IAM user - waiting for GitHub OIDC integration to stabilize
# https://github.com/aws-actions/configure-aws-credentials/pull/284
################################################################################

resource "aws_iam_user" "cicd" {
  name = local.project
  path = "/cicd/"
  tags = local.tags
}

data "aws_iam_policy_document" "cicd" {
  statement {
    sid       = "AssumeSignerRole"
    actions   = ["sts:AssumeRole"]
    resources = [aws_iam_role.signer.arn]
  }
}

resource "aws_iam_user_policy" "cicd" {
  name   = local.project
  user   = aws_iam_user.cicd.name
  policy = data.aws_iam_policy_document.cicd.json
}
