# LA-MORO

## UI/UX Pro Max skill

This repo has the [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
plugin vendored into `.claude/skills/`, so its skills load automatically for
Claude Code sessions in this project — no marketplace install required.

Bundled skills:

| Skill | Purpose |
| --- | --- |
| `ui-ux-pro-max` | Core design intelligence: 84 styles, 161 palettes, 73 font pairings, 25 charts across 17 stacks |
| `ui-styling` | Tailwind / shadcn theming, responsive utilities, canvas fonts |
| `design-system` | Design tokens, component specs, states & variants |
| `design` | Logos, icons, CIP, slides design routing |
| `brand` | Brand guidelines, voice, color/typography management |
| `slides` | Slide layouts, copywriting formulas, HTML templates |
| `banner-design` | Banner sizes and styles |

Source: `nextlevelbuilder/ui-ux-pro-max-skill` (v2.6.2, MIT).

To update, re-copy `.claude/skills/` from the upstream repo, or use the upstream
CLI: `npx ui-ux-pro-max-cli init --ai claude`.
