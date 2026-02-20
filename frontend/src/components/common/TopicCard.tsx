import { Link } from 'react-router-dom';
import { Topic } from '../../api/types';
import { Button } from '../ui/Button';

interface TopicCardProps {
  topic: Topic;
}

export function TopicCard({ topic }: TopicCardProps) {
  return (
    <article className="rounded-xl border-4 border-slate-700 bg-slate-100 p-5">
      <h3 className="text-lg font-semibold text-slate-900">{topic.title}</h3>
      <p className="mt-2 text-sm text-slate-600">
        {topic.description ?? 'Описание темы пока не заполнено.'}
      </p>
      <div className="mt-4">
        <Link to={`/topics/${topic.id}`}>
          <Button>Открыть тему</Button>
        </Link>
      </div>
    </article>
  );
}


