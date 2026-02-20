import { Link } from 'react-router-dom';
import { Game } from '../../api/types';
import { Button } from '../ui/Button';

interface GameCardProps {
  game: Game;
}

const gameTypeLabel: Record<Game['type'], string> = {
  PHISHING_DETECTOR: 'Найди признаки фишинга',
  PASSWORD_STRENGTH: 'Создай сложный пароль',
  QUIZ_SIMULATION: '���������',
  SOCIAL_NETWORK_SCENARIO: '�������',
};

export function GameCard({ game }: GameCardProps) {
  const playRoute =
    game.type === 'PHISHING_DETECTOR'
      ? '/mini-games/phishing'
      : game.type === 'PASSWORD_STRENGTH'
        ? '/mini-games/password'
        : `/games/${game.id}/play`;

  return (
    <article className="rounded-xl border-4 border-slate-700 bg-slate-100 p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {gameTypeLabel[game.type]}
      </p>
      <h3 className="mt-1 text-lg font-semibold text-slate-900">{game.title}</h3>
      <div className="mt-4">
        <Link to={playRoute}>
          <Button>Играть</Button>
        </Link>
      </div>
    </article>
  );
}
