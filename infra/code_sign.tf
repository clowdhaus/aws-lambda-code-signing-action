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
  name_prefix = local.project
  platform_id = "AWSLambda-SHA384-ECDSA"

  signature_validity_period {
    value = 5
    type  = "YEARS"
  }

  tags = local.tags
}

resource "aws_signer_signing_profile_permission" "sp_permission_1" {
  profile_name = aws_signer_signing_profile.this.name
  action       = "signer:StartSigningJob"
  principal    = var.aws_account
  statement_id = "ProdAccountStartSigningJob_StatementId"
}

resource "aws_signer_signing_profile_permission" "sp_permission_2" {
  profile_name = aws_signer_signing_profile.this.name
  action       = "signer:GetSigningProfile"
  principal    = var.aws_team_role_arn
  statement_id = "ProdAccountStartSigningJob_StatementId"
}

resource "aws_signer_signing_profile_permission" "sp_permission_3" {
  profile_name        = aws_signer_signing_profile.this.name
  action              = "signer:RevokeSignature"
  principal           = "123456789012"
  profile_version     = aws_signer_signing_profile.prod_sp.version
  statement_id_prefix = "version-permission-"
}
