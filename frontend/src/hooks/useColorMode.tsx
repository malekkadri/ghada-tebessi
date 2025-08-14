import { useEffect } from 'react';
import useLocalStorage from './useLocalStorage';

type ColorMode = 'light' | 'dark';
type SetColorMode = (value: ColorMode | ((val: ColorMode) => ColorMode)) => void;

const useColorMode = (): [ColorMode, SetColorMode] => {
  const [colorMode, setColorMode] = useLocalStorage<ColorMode>('color-theme', 'light');

  useEffect(() => {
    const className = 'dark';
    const htmlClass = window.document.documentElement.classList;

    colorMode === 'dark'
      ? htmlClass.add(className)
      : htmlClass.remove(className);
  }, [colorMode]);

  return [colorMode, setColorMode];
};

export default useColorMode;