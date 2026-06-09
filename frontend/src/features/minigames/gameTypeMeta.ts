import { GameType } from '../../api/types';

export const interactiveGameTypes = [
  'MFA_CHALLENGE',
  'UPDATE_TRIAGE',
  'BACKUP_STRATEGY',
  'SAFE_DOWNLOADS',
  'APP_PERMISSION_AUDIT',
] as const;

export type InteractiveGameType = (typeof interactiveGameTypes)[number];

export const gameTypeLabels: Record<GameType, string> = {
  QUIZ_SIMULATION: 'Симуляция викторины',
  PHISHING_DETECTOR: 'Детектор фишинга',
  PASSWORD_STRENGTH: 'Надёжность пароля',
  SOCIAL_NETWORK_SCENARIO: 'Сценарий в соцсетях',
  MFA_CHALLENGE: 'Подбор второго фактора',
  UPDATE_TRIAGE: 'Триаж обновлений',
  BACKUP_STRATEGY: 'Стратегия 3-2-1',
  SAFE_DOWNLOADS: 'Безопасные загрузки',
  APP_PERMISSION_AUDIT: 'Аудит разрешений',
};

export function isInteractiveGameType(type: GameType): type is InteractiveGameType {
  return (interactiveGameTypes as readonly string[]).includes(type);
}
