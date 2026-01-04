import { getSubmissionsAction } from '@/actions/submissions';
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
} from '@/components/ui/accordion';

export default async function SubmissionsPage() {
  const groupedSubmissions = await getSubmissionsAction();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Pengumpulan</CardTitle>
        <CardDescription>
          Tinjau pengumpulan dari siswa untuk setiap modul. Klik setiap modul
          untuk melihat detail.
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full">
        {groupedSubmissions.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {groupedSubmissions.map(
              ({ module, submissions, total_submissions }) => (
                <AccordionItem value={module.id} key={module.id}>
                  <AccordionTrigger>
                    <div className="flex flex-col items-start text-left">
                      <span className="font-semibold">{module.title}</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge variant="outline">{module.grade.name}</Badge>
                        <Badge variant="secondary">{module.subject.name}</Badge>
                        <Badge variant="default">
                          {total_submissions} Pengumpulan
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {submissions.length > 0 ? (
                      <div className="overflow-hidden rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nama Siswa</TableHead>
                              <TableHead className="text-center">
                                Skor
                              </TableHead>
                              <TableHead className="text-right">
                                Dikumpulkan
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {submissions
                              .sort(
                                (a, b) =>
                                  new Date(b.submitted_at).getTime() -
                                  new Date(a.submitted_at).getTime()
                              )
                              .map((submission, index) => (
                                <TableRow
                                  key={`${module.id}-${submission.student_name}-${index}`}
                                >
                                  <TableCell className="font-medium">
                                    {submission.student_name}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {submission.total_correct}/
                                    {submission.total_questions}
                                  </TableCell>
                                  <TableCell className="text-right text-muted-foreground">
                                    {formatDistanceToNow(
                                      new Date(submission.submitted_at),
                                      { addSuffix: true, locale: id }
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground border-2 border-dashed rounded-lg p-8">
                        <p>Belum ada pengumpulan untuk modul ini.</p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              )
            )}
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
