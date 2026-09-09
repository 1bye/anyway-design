# Anyway MD installer

Apply a setup link in the current project:

```sh
npx --yes https://md.anyway.design/cli.tgz https://md.anyway.design/p/<id>
```

The app serves this package directly; npm publication is not required. The domain must be deployed before the production URL works. Local development uses the builder's local origin in both URLs.

Requires Node.js 22+ and Git. `--dry-run` lists destinations without downloading skills or writing files. Existing differing files cause a refusal. `--force` first moves them into `.anyway-md/backups/<timestamp>/`. Reapplying identical contents is a no-op.

Skills are fetched from pinned GitHub revisions. Complete selected skill directories are copied, including references and scripts. No skill scripts are executed during installation. Symlinks, invalid source paths, and oversized skill trees are rejected. All downloads finish before project files are replaced. A local `.anyway-md.json` records skill sources and revisions.
