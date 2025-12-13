import type { Movie } from './movie';

export type RootStackParamList = {
  MainTabs: undefined;
  MovieDetails: { movie: Movie };
  Stats: undefined;
  Profile: undefined;
  VideoPlayer: { videoKey: string };
};

export type MainTabParamList = {
  Home: undefined;
  Liked: undefined;
  Friends: undefined;
  Settings: undefined;
};
