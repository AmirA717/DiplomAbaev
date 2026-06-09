import { Link } from 'react-router-dom';
import { Game } from '../../api/types';
import { gameTypeLabels } from '../../features/minigames/gameTypeMeta';
import { Button } from '../ui/Button';

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  return (
    <article className="rounded-xl border-4 border-slate-700 bg-slate-100 p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {gameTypeLabels[game.type]}
      </p>
      <h3 className="mt-1 text-lg font-semibold text-slate-900">{game.title}</h3>
      <div className="mt-4">
        <Link to={`/games/${game.id}/play`}>
          <Button>Играть</Button>
        </Link>
      </div>
    </article>
  );
}
