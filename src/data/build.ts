import { execSync } from 'node:child_process';

const envSha =
  process.env.CF_PAGES_COMMIT_SHA ??
  process.env.GITHUB_SHA ??
  process.env.VERCEL_GIT_COMMIT_SHA ??
  process.env.PUBLIC_GIT_SHA;

const readGitSha = () => {
  try {
    return execSync('git rev-parse --short=7 HEAD', {
      stdio: ['ignore', 'pipe', 'ignore'],
    }).toString().trim();
  } catch {
    return 'local';
  }
};

export const build = {
  version: (envSha?.slice(0, 7) || readGitSha()) || 'local',
};
