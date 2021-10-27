# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.1] - 2021-10-27

### Added

- Added links to the genre column on the list-view
- Added page forward/back buttons to main layout

### Changed

- Increase delay when completing mouse drag select in list view from `100ms` -> `200ms`
- Change casing for main application name `sonixd` -> `Sonixd`

### Fixed

- Fixed Linux media hotkey support (MPRIS)
  - Added commands for additional events `play` and `pause` (used by KDE's media player overlay)
  - Set status to `Playing` when initially starting a song
  - Set current song metadata when track automatically changes instead of only when it manually changes
- Fixed filtered link to Album List on the Album page
- Fixed filtered link to Album List on the Dashboard page
- Fixed font color for lists/tables in panels
  - Affects the search view song list and column selector list

## [0.4.0] - 2021-10-26

### Added

- Added music folder selector (#52)
- Added media hotkeys / MPRIS support for Linux (#50)
  - This is due to dbus overriding the global shortcuts that electron sends
- Added advanced column selector component
  - Drag-n-drop list
  - Individual resizable columns
- (Windows) Added tray (Thanks @ncarmic4) (#45)
  - Settings to minimize/exit to tray

### Changed

- Page selections are now persistent
  - Active tab on config page
  - Active tab on favorites page
  - Filter selector on album list page
- Playlists can now be saved after being sorted using column filters
- Folder view
  - Now shows all root folders in the list instead of in the input picker
  - Now shows music folders in the input picker
  - Now uses loader when switching pages
- Changed styling for various views/components
  - Look & Feel setting page now split up into multiple panels
  - Renamed context menu button `Remove from current` -> `Remove selected`
  - Page header titles width increased from `45%` -> `80%`
  - Renamed `Scan library` -> `Scan`
- All pages no longer refetch data when clicking back into the application

### Fixed

- Fixed shift-click multi select on a column-sorted list-view
- Fixed right-click context menu showing up behind all modals (#55)
- Fixed mini player showing up behind tag picker elements
- Fixed duration showing up as `NaN:NaN` when duration is null or invalid
- Fixed albums showing as a folder in Navidrome instances

## [0.3.0] - 2021-10-16

### Added

- Added folder browser (#1)
  - Added context menu button `View in folder`
  - Requires that your server has support for the original `/getIndexes` and `/getMusicDirectory` endpoints
- Added configurable row-hover highlight for list-view
- (Windows) Added playback controls in thumbnail toolbar (#32)
- (Windows/macOS) Added window size/position remembering on application close (#31)

### Changed

- Changed styling for various views/components
  - Tooltips added on grid-view card hover buttons
  - Mini-player removed rounded borders and increased opacity
  - Mini-player removed animation on open/close
  - Search bar now activated from button -> input on click / CTRL+F
  - Page header toolbar buttons styling consistency
  - Album list filter moved from right -> left
  - Reordered context menu button `Move selected to [...]`
  - Decreased horizontal width of expanded sidebar from 193px -> 165px

### Fixed

- Fixed duplicate scrobble requests when pause/resuming a song after the scrobble threshold (#30)
- Fixed genre column not applying in the song list-view
- Fixed default titlebar set on first run

## [0.2.1] - 2021-10-11

### Fixed

- Fixed using play buttons on the artist view not starting playback
- Fixed favoriting on horizontal scroll menu on dashboard/search views
- Fixed typo on default artist list viewtype
- Fixed artist image selection on artist view

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
