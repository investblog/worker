# Changelog

All notable changes to this project will be documented in this file.

## [0.4.0] - 2025-07-23
### Added
- Improved bot detection using ASN checks.

## [0.3.0] - 2025-07-22
### Added
- Configurable `REDIRECT_COUNTRY` environment variable to choose which country is redirected.

## [0.2.0] - 2024-06-05
### Added
- Additional bot detection using `Sec-Fetch` headers and HTML Accept check.
- Method check to bypass redirects on non-GET requests.

## [0.1.0] - 2024-06-01
### Added
- Basic Cloudflare Worker for redirecting Russian mobile traffic.
- Default environment variables in `wrangler.toml`.
