terraform {
  required_version = "~> 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 3.17" # https://github.com/hashicorp/terraform-provider-aws/blob/main/CHANGELOG.md#3170-november-24-2020
    }
  }

  # Be sure to change to your own backend when running locally
  backend "s3" {
    bucket         = "clowd-haus-terraform-state-us-east-1"
    key            = "aws-lambda-code-signing-action/infra/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "clowd-haus-terraform-state"
    encrypt        = true
  }
}

provider "aws" {
  region = "us-east-1"
}

################################################################################
# Common Locals
################################################################################

locals {
  account_id  = data.aws_caller_identity.current.account_id
  region      = data.aws_region.current.name
  environment = "dev"
  project     = "aws-lambda-code-signing-action"

  tags = {
    Repository  = "https://github.com/clowdhaus/${local.project}"
    Environment = local.environment
  }
}

################################################################################
# Common Data
################################################################################

data "aws_caller_identity" "current" {}

data "aws_region" "current" {}
