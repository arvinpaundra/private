'use server';

import { revalidatePath } from 'next/cache';
import type { Grade, Subject, Module, Question, Submission } from './types';

// In-memory store
let grades: Grade[] = [
    { id: 'g1', name: 'Kelas 10', description: 'Kurikulum untuk siswa kelas 10.' },
    { id: 'g2', name: 'Kelas 11', description: 'Kurikulum untuk siswa kelas 11.' },
    { id: 'g3', name: 'Kelas 12', description: 'Kurikulum untuk siswa kelas 12.' },
];

let subjects: Subject[] = [
    { id: 's1', name: 'Biologi', description: 'Studi tentang kehidupan dan organisme hidup.' },
    { id: 's2', name: 'Matematika', description: 'Studi tentang angka, kuantitas, dan ruang.' },
    { id: 's3', name: 'Sejarah', description: 'Studi tentang masa lalu.' },
];

let modules: Module[] = [
    {
        id: 'm1',
        slug: 'dasar-dasar-fotosintesis',
        title: 'Dasar-dasar Fotosintesis',
        description: 'Pelajari bagaimana tumbuhan mengubah cahaya matahari menjadi energi. Modul ini mencakup persamaan dasar fotosintesis, peran klorofil, dan pentingnya bagi kehidupan di Bumi.',
        subjectId: 's1',
        gradeId: 'g1',
        isPublished: true,
        questions: [
            {
                id: 'q1-1',
                prompt: 'Apa produk utama dari fotosintesis?',
                choices: [
                    { id: 'c1-1-1', text: 'Oksigen' },
                    { id: 'c1-1-2', text: 'Glukosa' },
                    { id: 'c1-1-3', text: 'Air' },
                    { id: 'c1-1-4', text: 'Karbon Dioksida' },
                ],
                correctAnswer: 'c1-1-2',
            },
            {
                id: 'q1-2',
                prompt: 'Pigmen hijau pada tumbuhan yang menyerap cahaya disebut...',
                choices: [
                    { id: 'c1-2-1', text: 'Kloroplas' },
                    { id: 'c1-2-2', text: 'Mitokondria' },
                    { id: 'c1-2-3', text: 'Klorofil' },
                ],
                correctAnswer: 'c1-2-3',
            }
        ]
    },
    {
        id: 'm2',
        slug: 'pengenalan-aljabar',
        title: 'Pengenalan Aljabar',
        description: 'Pahami konsep dasar aljabar, termasuk variabel, ekspresi, dan penyelesaian persamaan sederhana.',
        subjectId: 's2',
        gradeId: 'g1',
        isPublished: false,
        questions: []
    },
    {
        id: 'm3',
        slug: 'revolusi-industri',
        title: 'Revolusi Industri',
        description: 'Jelajahi perubahan besar dalam manufaktur, pertanian, dan transportasi yang terjadi pada abad ke-18 dan ke-19.',
        subjectId: 's3',
        gradeId: 'g2',
        isPublished: true,
        questions: [
            {
                id: 'q3-1',
                prompt: 'Di negara manakah Revolusi Industri dimulai?',
                choices: [
                    { id: 'c3-1-1', text: 'Prancis' },
                    { id: 'c3-1-2', text: 'Amerika Serikat' },
                    { id: 'c3-1-3', text: 'Inggris Raya' },
                    { id: 'c3-1-4', text: 'Jerman' },
                ],
                correctAnswer: 'c3-1-3',
            }
        ]
    }
];

let submissions: Submission[] = [
    { id: 'sub1', moduleId: 'm1', studentName: 'Budi', score: 2, submittedAt: '2024-07-20T10:00:00Z' },
    { id: 'sub2', moduleId: 'm1', studentName: 'Siti', score: 1, submittedAt: '2024-07-20T11:30:00Z' },
    { id: 'sub3', moduleId: 'm3', studentName: 'Joko', score: 1, submittedAt: '2024-07-21T09:00:00Z' },
];


// Grades
export async function getGrades(): Promise<Grade[]> {
  return Promise.resolve(grades);
}

export async function getGradeById(gradeId: string): Promise<Grade | undefined> {
    return Promise.resolve(grades.find(g => g.id === gradeId));
}

export async function addGrade(data: Pick<Grade, 'name' | 'description'>): Promise<Grade> {
  const newGrade: Grade = {
    id: `g-${Date.now()}`,
    ...data,
  };
  grades.push(newGrade);
  revalidatePath('/dashboard/grades');
  return Promise.resolve(newGrade);
}

export async function updateGrade(id: string, data: Partial<Omit<Grade, 'id'>>): Promise<Grade | undefined> {
    const gradeIndex = grades.findIndex(g => g.id === id);
    if (gradeIndex === -1) return undefined;
    grades[gradeIndex] = { ...grades[gradeIndex], ...data };
    revalidatePath('/dashboard/grades');
    return Promise.resolve(grades[gradeIndex]);
}

export async function deleteGrade(id: string): Promise<{ success: boolean }> {
    const gradeIndex = grades.findIndex(g => g.id === id);
    if (gradeIndex > -1) {
        grades.splice(gradeIndex, 1);
        revalidatePath('/dashboard/grades');
        return { success: true };
    }
    return { success: false };
}


// Subjects
export async function getSubjects(): Promise<Subject[]> {
  return Promise.resolve(subjects);
}

export async function addSubject(data: Pick<Subject, 'name' | 'description'>): Promise<Subject> {
    const newSubject: Subject = {
        id: `s-${Date.now()}`,
        ...data,
    };
    subjects.push(newSubject);
    revalidatePath('/dashboard/subjects');
    return Promise.resolve(newSubject);
}

export async function updateSubject(id: string, data: Partial<Omit<Subject, 'id'>>): Promise<Subject | undefined> {
    const subjectIndex = subjects.findIndex(s => s.id === id);
    if (subjectIndex === -1) return undefined;
    subjects[subjectIndex] = { ...subjects[subjectIndex], ...data };
    revalidatePath('/dashboard/subjects');
    return Promise.resolve(subjects[subjectIndex]);
}

export async function deleteSubject(id: string): Promise<{ success: boolean }> {
    const subjectIndex = subjects.findIndex(s => s.id === id);
    if (subjectIndex > -1) {
        subjects.splice(subjectIndex, 1);
        revalidatePath('/dashboard/subjects');
        return { success: true };
    }
    return { success: false };
}

// Modules
export async function getModules(): Promise<(Module & { subjectName: string; gradeName: string; })[]> {
  const detailedModules = modules.map(m => {
    const subject = subjects.find(s => s.id === m.subjectId);
    const grade = grades.find(g => g.id === m.gradeId);
    return {
      ...m,
      subjectName: subject?.name || 'Tidak Diketahui',
      gradeName: grade?.name || 'Tidak Diketahui',
    };
  });
  return Promise.resolve(detailedModules);
}

export async function getPublishedModules(): Promise<(Module & { subjectName: string; gradeName: string; })[]> {
    const allModules = await getModules();
    return allModules.filter(m => m.isPublished);
}


export async function getModuleById(moduleId: string): Promise<Module | undefined> {
  const module = modules.find(m => m.id === moduleId);
  return Promise.resolve(module);
}

export async function getModuleBySlug(slug: string): Promise<Module | undefined> {
    return Promise.resolve(modules.find(m => m.slug === slug));
}

export async function toggleModulePublish(id: string): Promise<Module | undefined> {
  const module = modules.find(m => m.id === id);
  if (module) {
    module.isPublished = !module.isPublished;
    revalidatePath('/dashboard/modules');
  }
  return Promise.resolve(module);
}

export async function addModule(data: Pick<Module, 'title' | 'subjectId' | 'gradeId' | 'description'>): Promise<Module> {
  const newModule: Module = {
    id: `m-${Date.now()}`,
    slug: data.title.toLowerCase().replace(/\s+/g, '-'),
    isPublished: false,
    questions: [],
    ...data,
  };
  modules.push(newModule);
  revalidatePath('/dashboard/modules');
  return Promise.resolve(newModule);
}

export async function updateModule(id: string, data: Partial<Omit<Module, 'id' | 'slug' | 'questions'>>): Promise<Module | undefined> {
    const moduleIndex = modules.findIndex(m => m.id === id);
    if (moduleIndex === -1) return undefined;
    
    const originalModule = modules[moduleIndex];
    const updatedModule = { ...originalModule, ...data };
    
    // If title changes, update slug
    if (data.title && data.title !== originalModule.title) {
        updatedModule.slug = data.title.toLowerCase().replace(/\s+/g, '-');
    }

    modules[moduleIndex] = updatedModule;
    
    revalidatePath('/dashboard/modules');
    revalidatePath(`/dashboard/modules/${id}`);
    if (updatedModule.slug) {
      revalidatePath(`/m/${updatedModule.slug}`);
    }
    
    return Promise.resolve(updatedModule);
}

export async function deleteModule(id: string): Promise<{ success: boolean }> {
  const index = modules.findIndex(m => m.id === id);
  if (index > -1) {
    modules.splice(index, 1);
    revalidatePath('/dashboard/modules');
    return { success: true };
  }
  return { success: false };
}

// Questions
export async function addQuestion(moduleId: string, data: Omit<Question, 'id'>): Promise<Question> {
  const module = modules.find(m => m.id === moduleId);
  if (!module) throw new Error('Modul tidak ditemukan');

  const newQuestion: Question = {
    id: `q-${Date.now()}`,
    ...data
  };

  module.questions.push(newQuestion);
  revalidatePath(`/dashboard/modules/${moduleId}`);
  return Promise.resolve(newQuestion);
}

export async function updateQuestion(moduleId: string, questionId: string, data: Omit<Question, 'id'>): Promise<Question> {
    const module = modules.find(m => m.id === moduleId);
    if (!module) throw new Error('Modul tidak ditemukan');

    const questionIndex = module.questions.findIndex(q => q.id === questionId);
    if (questionIndex === -1) throw new Error('Pertanyaan tidak ditemukan');

    const updatedQuestion = { ...module.questions[questionIndex], ...data };
    module.questions[questionIndex] = updatedQuestion;
    
    revalidatePath(`/dashboard/modules/${moduleId}`);
    return Promise.resolve(updatedQuestion);
}


export async function deleteQuestion(moduleId: string, questionId: string): Promise<{ success: boolean }> {
    const module = modules.find(m => m.id === moduleId);
    if (module) {
        const qIndex = module.questions.findIndex(q => q.id === questionId);
        if (qIndex > -1) {
            module.questions.splice(qIndex, 1);
            revalidatePath(`/dashboard/modules/${moduleId}`);
            return { success: true };
        }
    }
    return { success: false };
}

export async function replaceQuestionsForModule(moduleId: string, newQuestions: Question[]): Promise<void> {
    const module = modules.find(m => m.id === moduleId);
    if (!module) {
        throw new Error("Modul tidak ditemukan");
    }
    // Simple replacement for in-memory data.
    // In a real DB, you'd perform deletes, updates, and inserts.
    module.questions = newQuestions.map(q => ({ ...q }));

    revalidatePath(`/dashboard/modules/${moduleId}`);
    return Promise.resolve();
}


// Submissions
export async function getSubmissionsGroupedByModule(): Promise<{
    module: (Module & { subjectName: string; gradeName: string; });
    submissions: Submission[];
}[]> {
    const allModules = await getModules();
    
    const grouped = submissions.reduce((acc, submission) => {
        if (!acc[submission.moduleId]) {
            acc[submission.moduleId] = [];
        }
        acc[submission.moduleId].push(submission);
        return acc;
    }, {} as Record<string, Submission[]>);

    const result = allModules
        .map(module => ({
            module,
            submissions: grouped[module.id] || []
        }))
        .filter(item => item.submissions.length > 0);

    return Promise.resolve(result);
}

export async function createSubmission(moduleId: string, studentName: string, score: number): Promise<Submission> {
    const newSubmission: Submission = {
        id: `sub-${Date.now()}`,
        moduleId,
        studentName,
        score,
        submittedAt: new Date().toISOString(),
    };
    submissions.push(newSubmission);
    revalidatePath('/dashboard/submissions');
    return Promise.resolve(newSubmission);
}
