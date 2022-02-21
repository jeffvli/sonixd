import { ipcMain } from 'electron';
import { Knex } from 'knex';
import { Artist, Genre } from '../types';

module.exports = (db: Knex) => {
  // Getters
  ipcMain.on('api-getGenres', async (event) => {
    const genres = await db('genre').select('id', 'title');
    await event.reply('api-getGenres-reply', genres);
  });

  // Setters
  ipcMain.on('api-setGenres', async (event, arg) => {
    const genres = await db('genre').insert(
      arg.map((genre: Genre) => {
        return { title: genre };
      })
    );

    await event.reply('api-setGenres-reply', genres);
  });

  ipcMain.on('api-setSong', async (event, arg) => {
    /* {
      genre:
      albumartist:
      artist:
      album:
      song:
    } */

    const genres = await db('genre')
      .insert(
        arg.genre.map((genre: Genre) => {
          return { title: genre.title };
        })
      )
      .onConflict()
      .ignore();

    console.log('genres', genres);

    const albumArtist = await db('albumartist')
      .insert({
        title: arg.albumArtist.title,
        image: arg.albumArtist.image,
        biography: arg.albumArtist.info?.biography,
      })
      .onConflict()
      .ignore();

    console.log('albumArtist', albumArtist);

    const artists = await db('artist')
      .insert(
        arg.artist.map((artist: Artist) => {
          return {
            title: artist.title,
            image: artist.image,
            biography: artist.info?.biography,
          };
        })
      )
      .onConflict()
      .ignore();

    console.log('artists', artists);

    const album = await db('album')
      .insert({
        title: arg.album.title,
        isDir: arg.album.isDir,
        albumArtistId: albumArtist[0],
        created: arg.album.created,
        year: arg.album.year,
        image: arg.album.image,
      })
      .onConflict()
      .ignore();

    console.log('album', album);

    // const song = await db('song').insert

    await event.reply('api-setSong-reply', 'Sent');
  });
};
