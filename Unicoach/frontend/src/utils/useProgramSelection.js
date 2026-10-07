import { useCallback, useMemo, useState } from 'react';

// Programs ticked on CourseFinder cards, for the compare / Excel export bar
export const useProgramSelection = () => {
  const [selectedPrograms, setSelectedPrograms] = useState([]);

  const toggleProgram = useCallback((program) => {
    setSelectedPrograms((prev) => (prev.some((p) => p.id === program.id)
      ? prev.filter((p) => p.id !== program.id)
      : [...prev, program]));
  }, []);

  const clearSelection = useCallback(() => setSelectedPrograms([]), []);
  const selectedIds = useMemo(() => selectedPrograms.map((p) => p.id), [selectedPrograms]);

  return { selectedPrograms, selectedIds, toggleProgram, clearSelection };
};
