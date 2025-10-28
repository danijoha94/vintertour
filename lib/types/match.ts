export interface Player {
  id: number;
  name: string;
}

export interface Team {
  title: string;
  player1: Player;
  player2: Player;
}

export interface Hole {
  number: number;
  team1_player: number;
  team2_player: number;
}

export interface Match {
  id: number;
  title: string;
  team1: Team;
  team2: Team;
  holes: Hole[];
}
