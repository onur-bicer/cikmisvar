export interface University {
    id: string;
    name: string;
    city: string;
    departments: Department[];
}

export interface Department {
    id: string;
    universityId: string;
    name: string;
    courses: Course[];
}

export interface Course {
    id: string;
    departmentId: string;
    name: string;
    fileCount: number;
}

export interface ExamFile {
    id: string;
    uploaderId: string;
    universityId: string;
    universityName: string;
    departmentId: string;
    departmentName: string;
    courseId: string;
    courseName: string;
    year: number;
    examType: "MIDTERM" | "FINAL" | "QUIZ" | "MAKEUP";
    fileSize: number;
    uploadedAt: string;
    viewCount: number;
    downloadCount: number;
    previewUrl?: string; // Blob URL or CDN URL
    isFavorite?: boolean;
    comments?: Comment[];
}

export interface Comment {
    id: string;
    userId: string;
    userName: string;
    text: string;
    createdAt: string;
    avatar?: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

export interface PopularSearch {
    id: string;
    label: string;
    query: string;
}
