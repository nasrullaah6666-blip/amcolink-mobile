#!/usr/bin/env bash
# Copies the files in $1 into the ci-results branch (in a fresh clone, so the build folder's changes never get in the way).
# Usage: push-results.sh <folder with files> <commit message>. Needs TOKEN and GITHUB_REPOSITORY.
set -euo pipefail
SRC="$1"; MSG="$2"
URL="https://x-access-token:${TOKEN}@github.com/${GITHUB_REPOSITORY}.git"
for attempt in 1 2 3; do
  rm -rf /tmp/cr
  if git clone -q --depth 1 --branch ci-results "$URL" /tmp/cr 2>/dev/null; then :; else
    git init -q /tmp/cr && git -C /tmp/cr checkout -q --orphan ci-results && git -C /tmp/cr remote add origin "$URL"
  fi
  for e in "$SRC"/*; do rm -rf "/tmp/cr/$(basename "$e")"; done
  cp -r "$SRC"/. /tmp/cr/
  git -C /tmp/cr -c user.name=ci-results -c user.email=ci-results@users.noreply.github.com add -A .
  git -C /tmp/cr -c user.name=ci-results -c user.email=ci-results@users.noreply.github.com commit -qm "$MSG" || true
  if git -C /tmp/cr push -q origin ci-results; then echo "results pushed"; exit 0; fi
  sleep 5
done
echo "could not push results"; exit 1
