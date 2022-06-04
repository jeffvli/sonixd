export const queryKeys = {
  album: (albumId: number) => ['album', albumId] as const,
  servers: ['servers'] as const,
};
