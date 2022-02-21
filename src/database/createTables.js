export const createTables = async (db) => {
  await db.schema.createTable('albumartist', (table) => {
    table.increments('id', { primaryKey: true });
    table.string('serverId').unique();
    table.string('title');
    table.string('image');
    table.string('biography');
  });

  await db.schema.createTable('artist', (table) => {
    table.increments('id', { primaryKey: true });
    table.string('serverId').unique();
    table.string('title');
    table.string('image');
    table.string('biography');
  });

  await db.schema.createTable('genre', (table) => {
    table.increments('id', { primaryKey: true });
    table.string('title').unique();
  });

  await db.schema.createTable('playlist', (table) => {
    table.increments('id', { primaryKey: true });
    table.string('serverId').unique();
    table.string('title');
    table.string('comment');
    table.string('owner');
    table.boolean('public');
    table.datetime('created');
    table.datetime('changed');
  });

  await db.schema.createTable('album', (table) => {
    table.increments('id', { primaryKey: true });
    table.string('serverId').unique();
    table.string('title');
    table.boolean('isDir');
    table
      .integer('albumArtistId')
      .references('id')
      .inTable('albumartist')
      .notNull()
      .onDelete('cascade');
    table.datetime('created');
    table.integer('year');
    table.string('image');
  });

  await db.schema.createTable('song', (table) => {
    table.increments('id', { primaryKey: true });
    table.string('serverId').unique();
    table.string('title');
    table.boolean('isDir');
    table.integer('albumId').references('id').inTable('album').notNull().onDelete('cascade');
    table
      .integer('albumArtistId')
      .references('id')
      .inTable('albumartist')
      .notNull()
      .onDelete('cascade');
    table.integer('track');
    table.year('integer');
    table.double('size');
    table.string('contentType');
    table.string('suffix');
    table.double('duration');
    table.integer('bitrate');
    table.string('path');
    table.integer('playCount');
    table.integer('discNumber');
    table.datetime('created');
    table.string('streamUrl');
    table.string('image');
    table.boolean('starred');
    table.integer('userRating');
  });

  await db.schema.createTable('playlist_song', (table) => {
    table.integer('playlistId').references('id').inTable('playlist').notNull();
    table.integer('songId').references('id').inTable('song').notNull();
  });

  await db.schema.createTable('artist_album', (table) => {
    table.integer('artistId').references('id').inTable('artist').notNull();
    table.integer('albumId').references('id').inTable('album').notNull();
  });

  await db.schema.createTable('album_genre', (table) => {
    table.integer('genreId').references('id').inTable('genre').notNull();
    table.integer('songId').references('id').inTable('song').notNull();
  });

  await db.schema.createTable('song_genre', (table) => {
    table.integer('genreId').references('id').inTable('genre').notNull();
    table.integer('songId').references('id').inTable('song').notNull();
  });

  await db.schema.createTable('albumartist_genre', (table) => {
    table.integer('genreId').references('id').inTable('genre').notNull();
    table.integer('albumArtistId').references('id').inTable('albumartist').notNull();
  });

  await db.schema.createTable('artist_genre', (table) => {
    table.integer('genreId').references('id').inTable('genre').notNull();
    table.integer('artistId').references('id').inTable('artist').notNull();
  });
};
