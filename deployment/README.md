# ZanderVera website deployment

Canonical source: https://github.com/zedpudding/zedpudding.github.io, branch master.
Active local checkout: `/Users/Agency689/Documents/ChatGPT/Zander Vera Site/website`.
Production host: Bluehost, `/home2/cwahbvmy/public_html/zandervera.com`.
GitHub retains source and history; GitHub Pages is retained only during DNS migration and should be disabled after cached DNS has expired and normal requests consistently reach Bluehost.

The previous checkout at `/Users/Agency689/zedpudding.github.io` has unpublished changes. Do not overwrite or silently publish those changes. The parent Zander Vera Site folder contains a separate Backpacker reference project and `portal/`; neither is the public website source.

## Publish

Commit reviewed website edits and push master. From this checkout:

```
python3 deployment/bluehost.py --build-only
python3 deployment/bluehost.py
python3 deployment/bluehost.py --apply
```

Deployment uses committed HEAD, not unstaged/untracked files. Use `--ref <commit>` to choose an exact version. Dry-run the same ref before publishing. This is a manual deployment workflow; pushing GitHub alone does not update Bluehost.

Existing `hvc-bluehost` SSH alias/key provides access. The alias name is historical; its hosting account serves both sites. No credentials belong in this repository. Deployment excludes source-management files, documentation and scripts. Public file types are allowlisted. New types must be reviewed and added explicitly.

Every apply takes a complete private pre-deploy snapshot under `/home2/cwahbvmy/zandervera-deploy-backups/<UTC timestamp>/site-before.tar.gz`; replaced files are also saved under `replaced/`. Transfers never delete files and preserve `.well-known`. Files removed from Git require separate deliberate remote cleanup. Updates are per-file, not atomic.

Rollback: redeploy a known-good commit with the same dry-run/apply process; for restoring a pre-migration state, extract the private snapshot into a staging folder, inspect it, then restore only this site's files. Do not restore over other sites. An older source revision lacking deployment/bluehost.htaccess requires using the saved snapshot instead.

Verify apex and www HTTPS, HTTP-to-HTTPS redirect, navigation, CSS, JS and images after each publish. DNS in Bluehost's public domain manager is authoritative; cPanel DNS edits alone did not update the public records during recovery.

Client portal: `clients.zandervera.com` remains separately hosted at `/home2/cwahbvmy/clients.zandervera.com`; never deploy this static website there. Preserve mail-related DNS records.
