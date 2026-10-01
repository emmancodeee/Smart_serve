## ADDED Requirements

### Requirement: CSS custom properties SHALL define the design system
The admin dashboard SHALL define all design tokens as CSS custom properties on `:root` in `admin.css`. Tokens SHALL include colors, spacing scale, border-radius, shadows, font sizes, and font weights.

#### Scenario: Color tokens are defined
- **WHEN** inspecting `:root` in `admin.css`
- **THEN** tokens SHALL exist for `--color-primary-navy`, `--color-sidebar-blue`, `--color-gold-accent`, `--color-gold-hover`, `--color-bg`, `--color-card-bg`, `--color-border`, `--color-text-primary`, `--color-text-secondary`, `--color-success`, `--color-warning`, `--color-danger`

#### Scenario: Spacing tokens are defined
- **WHEN** inspecting `:root` in `admin.css`
- **THEN** tokens SHALL exist for `--spacing-page` (32px), `--spacing-section` (24px), `--spacing-card` (20px)

#### Scenario: Border-radius tokens are defined
- **WHEN** inspecting `:root` in `admin.css`
- **THEN** tokens SHALL exist for `--radius-card` (20px), `--radius-button` (12px), `--radius-input` (12px), `--radius-table` (18px)

#### Scenario: Shadow token is defined
- **WHEN** inspecting `:root` in `admin.css`
- **THEN** a token SHALL exist for `--shadow-card` with value `0 8px 24px rgba(15,23,42,.08)`
