"""Create a new portable skill archive without overwriting existing versions."""
import argparse
import hashlib
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', required=True, help='New ZIP filename, relative to repository root or absolute')
    args = parser.parse_args()
    root = Path(__file__).resolve().parent.parent
    source = root / 'skills' / 'research-paper-site-builder'
    output = Path(args.output)
    if not output.is_absolute():
        output = root / output
    output = output.resolve()
    if output.suffix.lower() != '.zip':
        parser.error('output must end in .zip')
    if source == output or source in output.parents:
        parser.error('output must not be inside the skill source')
    if output.exists():
        parser.error('output already exists; choose a new version filename')
    if not (source / 'SKILL.md').is_file():
        parser.error('skill entrypoint not found')
    files = sorted(p for p in source.rglob('*') if p.is_file())
    if any(p.is_symlink() or any(part in {'.git', '__pycache__', 'node_modules'} for part in p.relative_to(source).parts) for p in files):
        parser.error('source contains symlinks or generated/private directories')
    output.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(output, 'x', ZIP_DEFLATED) as archive:
        for path in files:
            archive.write(path, (Path(source.name) / path.relative_to(source)).as_posix())
    with ZipFile(output) as archive:
        if archive.testzip() is not None:
            raise RuntimeError('ZIP integrity failed')
        for path in files:
            name = (Path(source.name) / path.relative_to(source)).as_posix()
            if archive.read(name) != path.read_bytes():
                raise RuntimeError('ZIP content mismatch: ' + name)
    print(f'{hashlib.sha256(output.read_bytes()).hexdigest()}  {output.name}')


if __name__ == '__main__':
    main()
