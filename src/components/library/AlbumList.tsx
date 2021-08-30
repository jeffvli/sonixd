import React from 'react';
import settings from 'electron-settings';
import GridViewType from '../viewtypes/GridViewType';
import ListViewType from '../viewtypes/ListViewType';

const AlbumList = ({ data, viewType }: any) => {
  if (viewType === 'grid') {
    return (
      <GridViewType
        data={data}
        cardTitle={{
          prefix: 'album',
          property: 'name',
          urlProperty: 'id',
        }}
        cardSubtitle={{ prefix: 'album', property: 'artist' }}
        playClick={{ type: 'album', idProperty: 'id' }}
        subUrl={`/library/artist/${data.artistId}`}
        size="150px"
        cacheType="album"
      />
    );
  }

  if (viewType === 'list') {
    return (
      <ListViewType
        data={data}
        tableColumns={settings.getSync('albumListColumns')}
        rowHeight={Number(settings.getSync('albumListRowHeight'))}
        fontSize={settings.getSync('albumListFontSize')}
        cacheImages={{
          enabled: settings.getSync('cacheImages'),
          cacheType: 'album',
        }}
        virtualized
      />
    );
  }
  return <></>;
};

export default AlbumList;
