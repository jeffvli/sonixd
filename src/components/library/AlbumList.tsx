import React from 'react';
import GridViewType from '../viewtypes/GridViewType';

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
      />
    );
  }
  return <></>;
};

export default AlbumList;
