import { create } from "zustand";

interface SearchState {
    query: string;
    selectedUniversityId: string;
    selectedDepartmentId: string;
    selectedCourseId: string;
    year: string;
    examType: string;
    activeChip: string;
    setQuery: (query: string) => void;
    setUniversity: (id: string) => void;
    setDepartment: (id: string) => void;
    setCourse: (id: string) => void;
    setYear: (year: string) => void;
    setExamType: (type: string) => void;
    setActiveChip: (chipId: string) => void;
    resetFilters: () => void;
}

const initialState = {
    query: "",
    selectedUniversityId: "",
    selectedDepartmentId: "",
    selectedCourseId: "",
    year: "",
    examType: "",
    activeChip: "ps-1",
};

export const useSearchStore = create<SearchState>((set) => ({
    ...initialState,
    setQuery: (query) => set({ query }),
    setUniversity: (id) =>
        set({
            selectedUniversityId: id,
            selectedDepartmentId: "",
            selectedCourseId: "",
        }),
    setDepartment: (id) =>
        set({
            selectedDepartmentId: id,
            selectedCourseId: "",
        }),
    setCourse: (id) => set({ selectedCourseId: id }),
    setYear: (year) => set({ year }),
    setExamType: (type) => set({ examType: type }),
    setActiveChip: (chipId) => set({ activeChip: chipId }),
    resetFilters: () => set(initialState),
}));
