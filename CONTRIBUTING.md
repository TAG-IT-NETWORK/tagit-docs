# Contributing to tagit-docs

Thank you for your interest in improving TAG IT Network documentation!

## Guidelines

### Writing Style

- **Clear and concise** — Avoid jargon unless defined in glossary
- **Action-oriented** — Use imperative mood ("Run the command", not "You should run")
- **Consistent** — Follow existing patterns and terminology

### File Structure

```
docs/
├── getting-started/    # Onboarding guides
├── architecture/       # System design docs
├── contracts/          # Smart contract reference
├── api/                # REST API docs
├── sdk/                # SDK guides
└── glossary.md         # Terminology
```

### Frontmatter

All docs require YAML frontmatter:

```yaml
---
title: Page Title
description: Brief description for SEO
---
```

### Code Examples

- Always specify language in code blocks
- Include comments for complex logic
- Test all code before committing

## Workflow

1. Fork the repository
2. Create feature branch: `git checkout -b docs/my-update`
3. Make changes
4. Run validation: `npm run validate`
5. Commit: `git commit -m 'docs: description of change'`
6. Push: `git push origin docs/my-update`
7. Open Pull Request

## Checklist

Before submitting:

- [ ] Frontmatter added (title, description)
- [ ] Links validated (`npm run links`)
- [ ] Markdown linted (`npm run lint`)
- [ ] Spelling checked
- [ ] Code examples tested

## Commit Messages

Format: `docs: brief description`

Examples:
- `docs: add TAGITPrograms contract reference`
- `docs: fix broken link in quickstart`
- `docs: update SDK installation instructions`

## Questions?

Open an issue or reach out to the team.
