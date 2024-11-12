# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2024-11-15

### Added
- Comprehensive error handling system
  - New error service in src/services/errorService.js
  - Dedicated error routes in src/routes/errorRoutes.js
  - Client-side error reporter in public/js/errorReporter.js
  - Error test page for debugging
- Frontend improvements
  - New styles and UI enhancements
  - Media monitoring interface improvements
  - Frontend server for better development experience

### Changed
- Restructured project organization
- Enhanced middleware system with better logging
- Improved configuration management
- Updated media service architecture

### Fixed
- Various error handling edge cases
- Media monitoring reliability issues
- Configuration loading problems

## [1.1.0] - 2024-11-12

### Added
- Comprehensive request logging system
  - New logger utility in src/utils/logger.js
  - Detailed request logging including timestamp, method, URL, IP, headers
  - All requests stored in logs/requests.log in JSON format
- Preview functionality for media files
  - Direct URL preview for images
  - Thumbnail preview generation for videos
  - Preview generation for accessible streams
  - Preview caching system
- New directories
  - /logs for request logs
  - /previews for media previews

### Changed
- Enhanced error handling for media processing
- Improved thumbnail generation with accessibility checks
- Better stream status checking
- More detailed response metadata

### Fixed
- Preview generation for inaccessible files
- Error handling in FFmpeg operations
- Stream status checking reliability

## [1.0.0] - 2024-11-01

### Added
- Initial release
- Basic media monitoring functionality
- Support for multiple protocols (RTSP, RTMP, HLS, DASH)
- Thumbnail generation
- Docker support
- Basic logging
