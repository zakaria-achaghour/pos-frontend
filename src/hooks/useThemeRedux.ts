import { useAppSelector, useAppDispatch } from '../store/hooks';
import {
  selectTheme,
  selectIsThemeInitialized,
  setTheme,
  toggleTheme,
} from '../store/slices/themeSlice';

export const useTheme = () => {
  const dispatch = useAppDispatch();
  
  const theme = useAppSelector(selectTheme);
  const isInitialized = useAppSelector(selectIsThemeInitialized);

  return {
    theme,
    isInitialized,
    setTheme: (newTheme: 'light' | 'dark') => dispatch(setTheme(newTheme)),
    toggleTheme: () => dispatch(toggleTheme()),
  };
};