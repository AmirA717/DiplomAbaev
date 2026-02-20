export function formatDate(dateValue: string) {
  return new Date(dateValue).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function toPercent(value: number) {
  return `${Math.round(value)}%`;
}


