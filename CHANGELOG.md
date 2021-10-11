# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2021-10-11

### Added

- Added setting to enable scrobbling playing/played tracks to your server (#17)
- Added setting to change between macOS and Windows styled titlebar (#23)
- Added app/build versions and update checker on the config page (#18)
- Added 'view in modal' button on the list-view context menu (#8)
- Added a persistent indicator on grid-view cards for favorited albums/artists (#7)
- Added buttons for 'Add to queue (next)' and 'Add to queue (later)' (#6)
- Added left/right scroll buttons to the horizontal scrolling menu (dashboard/search)
- Added last.fm link to artist page
- Added link to cache location to open in local file explorer
- Added reset to default for cache location
- Added additional tooltips
  - Grid-view card title and subtitle buttons
  - Cover art on the player bar
  - Header titles on album/artist pages

### Changed

- Changed starring logic on grid-view card to update local cache instead of refetch
- Changed styling for various views/components
  - Use dynamically sized hover buttons on grid-view cards depending on the card size
  - Decreased size of buttons on album/playlist/artist pages
  - Input picker text color changed from primary theme color to primary text color
  - Crossfade type config changed from radio buttons to input picker
  - Disconnect button color from red to default
  - Tooltip styling updated to better match default theme
  - Changed tag links to text links on album page
- Changed page header images to use cache (album/artist)
  - Artist image now falls back to last.fm if no local image

### Fixed

- Fixed song & image caching (#16)
- Fixed set default artist list view type on first startup

## [0.1.0] - 2021-10-06

### Added

- Initial release
