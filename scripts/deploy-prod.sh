#!/usr/bin/env bash
set -euo pipefail

# Deploys the dashboard app to production via the Vercel CLI.
#
# Must run `vercel deploy` with the repo root as its working directory, not
# apps/dashboard -- the "dashboard" Vercel project's Root Directory setting is
# apps/dashboard (required for the git-integration auto-deploy path, which clones
# the whole monorepo and then cds into apps/dashboard to run apps/dashboard/vercel.json's
# buildCommand). `vercel deploy` uploads whatever directory it's invoked from as the
# project source, then ALSO applies that Root Directory setting on top of the upload.
# Run from apps/dashboard, that means Vercel looks for an apps/dashboard folder INSIDE
# the already-apps/dashboard-scoped upload, which doesn't exist, and the deploy fails
# with "The specified Root Directory apps/dashboard does not exist." Running from the
# repo root uploads the whole monorepo, which does contain that folder, so it resolves
# correctly. This script exists so that fact never has to be remembered by hand again --
# same REPO_ROOT pattern as check-tenant-scoping.sh, so it's correct regardless of where
# it's invoked from.
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"
exec npx vercel deploy --prod "$@"
