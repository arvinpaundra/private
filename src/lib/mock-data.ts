import type { Grade, Subject, Module, Submission } from './types';

export const grades: Grade[] = [
    { id: 'g1', name: 'Kelas 10', description: 'Kurikulum untuk siswa kelas 10.' },
    { id: 'g2', name: 'Kelas 11', description: 'Kurikulum untuk siswa kelas 11.' },
    { id: 'g3', name: 'Kelas 12', description: 'Kurikulum untuk siswa kelas 12.' },
];

export const subjects: Subject[] = [
    { id: 's1', name: 'Biologi', description: 'Studi tentang kehidupan dan organisme hidup.' },
    { id: 's2', name: 'Matematika', description: 'Studi tentang angka, kuantitas, dan ruang.' },
    { id: 's3', name: 'Sejarah', description: 'Studi tentang masa lalu.' },
];

export const modules: Module[] = [
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

export const submissions: Submission[] = [
    { id: 'sub1', moduleId: 'm1', studentName: 'Budi', score: 2, submittedAt: '2024-07-20T10:00:00Z' },
    { id: 'sub2', moduleId: 'm1', studentName: 'Siti', score: 1, submittedAt: '2024-07-20T11:30:00Z' },
    { id: 'sub3', moduleId: 'm3', studentName: 'Joko', score: 1, submittedAt: '2024-07-21T09:00:00Z' },
];
