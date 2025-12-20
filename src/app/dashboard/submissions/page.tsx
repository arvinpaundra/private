import { getSubmissionsGroupedByModule } from '@/lib/data-actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default async function SubmissionsPage() {
  const groupedSubmissions = await getSubmissionsGroupedByModule();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Pengumpulan</CardTitle>
        <CardDescription>
          Tinjau pengumpulan dari siswa untuk setiap modul. Klik setiap modul untuk melihat detailnya.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {groupedSubmissions.length > 0 ? (
           <Accordion type="single" collapsible className="w-full">
            {groupedSubmissions.map(({ module, submissions }) => (
                <AccordionItem value={module.id} key={module.id}>
                    <AccordionTrigger>
                        <div className="flex flex-col items-start text-left">
                           <span className="font-semibold">{module.title}</span>
                           <div className="flex flex-wrap gap-2 mt-1">
                             <Badge variant="outline">{module.gradeName}</Badge>
                             <Badge variant="secondary">{module.subjectName}</Badge>
                             <Badge variant="default">{submissions.length} Pengumpulan</Badge>
                           </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                         <div className="overflow-hidden rounded-md border">
                            <Table>
                                <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Siswa</TableHead>
                                    <TableHead className="text-center">Skor</TableHead>
                                    <TableHead className="text-right">Dikumpulkan</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                {submissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()).map(submission => (
                                    <TableRow key={submission.id}>
                                    <TableCell className="font-medium">{submission.studentName}</TableCell>
                                    <TableCell className="text-center">
                                        {submission.score}/{module.questions.length}
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground">
                                        {formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true, locale: id })}
                                    </TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                         </div>
                    </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
            <div className="text-center text-muted-foreground border-2 border-dashed rounded-lg p-12">
                <p>Belum ada pengumpulan.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}