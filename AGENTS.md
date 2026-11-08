# Sharing repository conventions

- This repository distributes the research-paper-site-builder skill and its practical workflow. Explain to users in Chinese; use English for code and identifiers.
- Canonical skill source: `skills/research-paper-site-builder/`. Repository onboarding: `README.md` and `docs/`. Shareable ZIPs: `dist/`. Packaging helper: `scripts/package_skill.py`.
- Keep the skill self-contained. Do not add EQHOT private source, paper databases, credentials, local absolute paths or unrelated project history.
- Preserve originals and unrelated changes. Do not delete files, force-push, change credentials or enable CI/deployment without applicable explicit authorization.
- After changes, run the skill validator when available, its Node tests, local Markdown link checks and ZIP content/integrity checks. Regenerate a new named package for changed skill contents; never silently replace an existing version.
- Public repository uploads are for sharing this skill and documentation. Building or deploying a user's literature website is a separate task.
