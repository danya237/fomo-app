import type { Movie } from './movie';

export type RootStackParamList = {
  // Auth screens (only when not authenticated)
  Login: undefined;
  Signup: undefined;
  
  // Main app screens (only when authenticated)
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
