import { Link } from 'react-router-dom';
import { Quiz } from '../../api/types';
import { Button } from '../ui/Button';

interface QuizCardProps {
  quiz: Quiz;
}

export function QuizCard({ quiz }: QuizCardProps) {
  return (
    <article className="rounded-xl border-4 border-slate-700 bg-slate-100 p-5">
      <h3 className="text-lg font-semibold text-slate-900">{quiz.name}</h3>
      <p className="mt-2 text-sm text-slate-600">{quiz.description}</p>
      <p className="mt-2 text-xs font-medium text-slate-500">Порог прохождения: {quiz.passingScore}</p>
      <div className="mt-4">
        <Link to={`/quiz/${quiz.id}/play`}>
          <Button>Начать тест</Button>
        </Link>
      </div>
    </article>
  );
}


