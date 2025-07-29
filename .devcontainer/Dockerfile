FROM node:20-slim

WORKDIR /workspace

RUN apt-get update && apt-get install -y \
  bash curl git && \
  rm -rf /var/lib/apt/lists/*

SHELL ["/bin/bash", "-c"]
