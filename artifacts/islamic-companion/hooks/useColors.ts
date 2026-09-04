import { useAppState } from '@/context/AppState';

export function useColors() {
  const { colors } = useAppState();
  return { ...colors, radius: 18 };
}