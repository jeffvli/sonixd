// Referenced from: https://betterprogramming.pub/the-best-way-to-manage-routes-in-a-react-project-with-typescript-c4e8d4422d64

export enum AppRoute {
  HOME = '/',
  LIBRARY = '/library',
  LIBRARY_ALBUM = '/library/album/:albumId',
  LOGIN = '/login',
  PLAYING = '/playing',
  SEARCH = '/search',
  SERVERS = '/servers',
}

type TArgs =
  | { path: AppRoute.HOME }
  | { path: AppRoute.LOGIN }
  | { path: AppRoute.PLAYING }
  | { path: AppRoute.SERVERS }
  | { path: AppRoute.SEARCH }
  | { path: AppRoute.LIBRARY }
  | {
      params: { albumId: string };
      path: AppRoute.LIBRARY_ALBUM;
    };

type TArgsWithParams = Extract<TArgs, { params: any; path: any }>;

export const createPath = (args: TArgs) => {
  // eslint-disable-next-line no-prototype-builtins
  if (args.hasOwnProperty('params') === false) return args.path;

  // Create a path by replacing params in the route definition
  return Object.entries((args as TArgsWithParams).params).reduce(
    (previousValue: string, [param, value]) =>
      previousValue.replace(`:${param}`, `${value}`),
    args.path
  );
};
