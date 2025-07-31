FROM node:20-slim

# Update our workspace (can take a while on first run)
RUN apt-get update && apt-get install -y \
  bash curl git && \
  rm -rf /var/lib/apt/lists/*

# Access the workspace
WORKDIR /workspace

SHELL ["/bin/bash", "-c"]
