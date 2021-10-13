terraform {
  required_version = "~> 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 3.17" # https://github.com/hashicorp/terraform-provider-aws/blob/main/CHANGELOG.md#3170-november-24-2020
    }
  }

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
  environment = "dev"
  project     = "clowdhaus/aws-lambda-code-signing-action"

  base_tags = {
    Repository  = "https://github.com/${local.project}"
    Environment = local.environment
  }
}
