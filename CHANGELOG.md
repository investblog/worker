# Changelog

All notable changes to this project will be documented in this file.

## [0.7.0] - 2025-07-26
### Changed
- Environment variable `DISABLE_RU_MOBILE_REDIRECT` renamed to `DISABLE_MOBILE_REDIRECT`.
- HTTP header check updated to support Safari/iPhone by ignoring missing `Upgrade-Insecure-Requests`.
- Worker and package names updated to generic *geo-mobile* naming.

## [0.6.0] - 2025-07-24
### Added
- Improved bot detection: added patterns for Google Mobile, PetalBot and common social scrapers.

## [0.5.0] - 2025-07-24
### Added
- Broader mobile UA detection including Samsung, MIUI, Huawei and other popular devices.

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
