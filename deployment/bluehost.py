"""Deploy a committed ZanderVera revision to Bluehost. Default is dry-run."""
import argparse
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath
import io
import shlex
import subprocess
import tarfile
import tempfile

ROOT = Path(__file__).resolve().parents[1]
REMOTE = '/home2/cwahbvmy/public_html/zandervera.com'
SSH = ['ssh', '-o', 'BatchMode=yes', '-o', 'StrictHostKeyChecking=yes', '-o', 'ConnectTimeout=15']
ALLOWED = {'.html', '.css', '.js', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.woff', '.woff2', '.ttf', '.ico', '.pdf', '.mp4', '.webm', '.txt', '.xml'}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--ref', default='HEAD', help='Committed revision to deploy')
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument('--apply', action='store_true')
    mode.add_argument('--build-only', action='store_true')
    args = parser.parse_args()
    commit = subprocess.check_output(['git', 'rev-parse', '--verify', args.ref + '^{commit}'], cwd=ROOT, text=True).strip()
    archive = subprocess.check_output(['git', 'archive', commit], cwd=ROOT)
    stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
    backup = '/home2/cwahbvmy/zandervera-deploy-backups/' + stamp
    with tempfile.TemporaryDirectory(prefix='zandervera-deploy-') as temp:
        staging = Path(temp)
        count = 0
        with tarfile.open(fileobj=io.BytesIO(archive)) as tar:
            for member in tar:
                path = PurePosixPath(member.name)
                if not member.isfile() or path.is_absolute() or '..' in path.parts:
                    continue
                if path.parts[0] == 'deployment' or any(p.startswith('.') for p in path.parts):
                    continue
                if path.suffix.lower() not in ALLOWED:
                    continue
                target = staging / path
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(tar.extractfile(member).read())
                target.chmod(0o644)
                count += 1
        if not (staging / 'index.html').is_file():
            raise SystemExit('Ref has no public index.html; refusing deployment.')
        htaccess = subprocess.check_output(['git', 'show', commit + ':deployment/bluehost.htaccess'], cwd=ROOT)
        (staging / '.htaccess').write_bytes(htaccess)
        (staging / '.htaccess').chmod(0o644)
        print(f'Committed revision: {commit}; public files: {count + 1}', flush=True)
        if args.build_only:
            print('Build validated; no remote changes.')
            return
        subprocess.run([*SSH, 'hvc-bluehost', 'test "$(id -un)" = cwahbvmy && test -d ' + REMOTE], check=True)
        if args.apply:
            # Complete site snapshot supports restoring previous content, including files
            # that disappear from a later revision. No runtime or portal data is included.
            subprocess.run([*SSH, 'hvc-bluehost', 'umask 077 && mkdir -p ' + backup + ' && tar -czf ' + backup + '/site-before.tar.gz -C ' + REMOTE + ' .'], check=True)
        for directory in [staging, *[p for p in staging.rglob('*') if p.is_dir()]]:
            directory.chmod(0o755)
        cmd = ['rsync', '-rlc', '--omit-dir-times', '--itemize-changes', '--backup', '--backup-dir=' + backup + '/replaced', '-e', shlex.join(SSH)]
        if not args.apply:
            cmd.append('--dry-run')
        # No --delete: preserve .well-known and hosting-managed files.
        subprocess.run([*cmd, str(staging) + '/', 'hvc-bluehost:' + REMOTE + '/'], check=True)
        print('Published. Backup: ' + backup if args.apply else 'Dry run complete; use --apply to publish this same ref.')
        print('Verify public HTTPS, redirects and changed assets. Removed source files remain remote until explicitly reviewed.')

if __name__ == '__main__':
    main()
