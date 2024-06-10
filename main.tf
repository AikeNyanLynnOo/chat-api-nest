# Define required providers
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "4.45.0"
    }
  }
}

# Configure the AWS provider
provider "aws" {
  region     = "ap-south-1"  # Can edit for desired region
  access_key = "access_key_here"  # AWS IAM access key
  secret_key = "secret_key_here"  # AWS IAM secret key
}

# Create an ECR repository
resource "aws_ecr_repository" "app_ecr_repo" {
  name = "nest-chat-socket-app" # REPO NAME
}