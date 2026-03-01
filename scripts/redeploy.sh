#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

timestamp="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "$timestamp" > force-deploy

git add force-deploy
git commit -m "chore(deploy): trigger redeploy at $timestamp"
git push origin main

echo "Redeploy trigger pushed: $timestamp"
