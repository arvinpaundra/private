# **App Name**: Private

## Core Features:

- User Authentication: Secure authentication system with login and registration using email and password. Implemented using NextAuth with credentials provider.
- Dashboard Management: Admin/teacher dashboard with CRUD operations for Grades, Subjects, Modules, and Questions. Provides a clear UI for managing learning content.
- Module Publishing: Publish/Unpublish toggle for modules. Only published modules are accessible to students.
- Student Module Access: Public module page ( /m/:slug ) accessible to students. Asks for student name before starting the module.
- Interactive Questions: Presents questions one by one with instant feedback on answer correctness. Utilizes smooth transitions and clear visual feedback.
- Dynamic Question Generation: AI-powered tool that dynamically generates question prompts and answers based on the learning content for each module.
- Progress Tracking: Visual representation of a student's progress through each module, displaying completed questions and overall score.

## Style Guidelines:

- Primary color: Deep Indigo (#667EEA) for a modern and elegant feel.
- Background color: Light gray (#F7FAFC) for a clean, neutral backdrop.
- Accent color: Teal (#4FD1C5) to complement the indigo and add vibrancy.
- Primary font: 'Poppins' (sans-serif) for headings and UI elements, providing a modern, geometric feel. Note: currently only Google Fonts are supported.
- Secondary font: 'PT Sans' (sans-serif) for body text to ensure good readability on mobile. Note: currently only Google Fonts are supported.
- Simple, consistent icons from Phosphor Icons to maintain a clean and elegant design.
- Clean, card-based layout with consistent spacing and padding, leveraging shadcn/ui components for a unified design system.
- Subtle Framer Motion animations for question transitions and answer feedback to guide attention and reinforce correctness.