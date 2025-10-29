#!/bin/bash

# This script automates the process of updating the project,
# pulling changes from Git, installing dependencies with pnpm,
# and copying the .env.example file to create a .env file.

# Git pull to update the project
git pull

# Install dependencies using pnpm
pnpm install

# Copy .env.example to create .env
cp .env.examples .env

echo "Project updated successfully!"
