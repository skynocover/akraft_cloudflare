import { useCallback, useEffect, useState } from "react";
import { Trash2, ExternalLink, FileX, MessageSquareX } from "lucide-react";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import LoadingOverlay from "./LoadingOverlay";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { client } from "@/utils/orpc";

interface Report {
  id: string;
  content: string;
  userIp: string;
  reportedIp: string;
  createdAt: Date;
  thread: { id: string; title: string; userIp: string | null } | null;
  reply: { id: string; content: string | null; userIp: string | null } | null;
}

interface ReportListProps {
  serviceId: string;
}

const ReportList: React.FC<ReportListProps> = ({ serviceId }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    if (!serviceId) return;
    setIsLoading(true);
    try {
      const reportData = await client.admin.getReports({ serviceId });
      setReports(reportData);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to fetch reports");
    } finally {
      setIsLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleDeleteReports = async () => {
    setIsLoading(true);
    try {
      await client.admin.deleteReports({
        serviceId,
        reportIds: selectedReports,
      });
      fetchReports();
      setSelectedReports([]);
      toast.success("Report(s) has been deleted.");
    } catch (error) {
      console.error("Error deleting reports:", error);
      toast.error("Failed to delete reports");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteThreadOrReply = async (report: Report) => {
    setIsLoading(true);
    setDeletingItemId(report.id);
    try {
      if (report.reply?.id) {
        await client.admin.deleteReply({
          serviceId,
          replyId: report.reply.id,
        });
        toast.success("Reply has been deleted.");
      } else if (report.thread?.id) {
        await client.admin.deleteThread({
          serviceId,
          threadId: report.thread.id,
        });
        toast.success("Thread has been deleted.");
      } else {
        toast.info("No associated thread or reply to delete.");
      }
      // Also delete the report
      await client.admin.deleteReports({
        serviceId,
        reportIds: [report.id],
      });
      fetchReports();
    } catch (error) {
      console.error("Error deleting thread or reply:", error);
      toast.error("Failed to delete. Please try again.");
    } finally {
      setDeletingItemId(null);
      setIsLoading(false);
    }
  };

  const handleViewReport = (threadId: string, replyId?: string) => {
    // Open in server app (different port in development)
    const serverUrl = import.meta.env.VITE_SERVER_URL || "";
    const url = `${serverUrl}/service/${serviceId}/${threadId}${
      replyId ? `#${replyId}` : `#${threadId}`
    }`;
    window.open(url, "_blank");
  };

  const handleSelectReport = (reportId: string) => {
    setSelectedReports((prev) =>
      prev.includes(reportId)
        ? prev.filter((id) => id !== reportId)
        : [...prev, reportId]
    );
  };

  const handleSelectAllReports = () => {
    setSelectedReports(
      selectedReports.length === reports.length
        ? []
        : reports.map((report) => report.id)
    );
  };

  return (
    <LoadingOverlay isLoading={isLoading}>
      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="outline"
                        className="bg-red-100 hover:bg-red-200 border-red-200 text-red-600"
                        disabled={selectedReports.length === 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Reports</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action will delete the selected report records.
                          It will not affect the associated threads or replies.
                          Are you sure you want to proceed?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteReports}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Delete selected report records (does not affect threads or
                    replies)
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={
                      selectedReports.length === reports.length &&
                      reports.length !== 0
                    }
                    onCheckedChange={handleSelectAllReports}
                  />
                </TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Reporter IP</TableHead>
                <TableHead>Poster IP</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No reports found
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedReports.includes(report.id)}
                        onCheckedChange={() => handleSelectReport(report.id)}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(report.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>{report.content}</TableCell>
                    <TableCell>{report.userIp}</TableCell>
                    <TableCell>{report.reportedIp}</TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              disabled={!report.thread && !report.reply}
                              onClick={() =>
                                handleViewReport(
                                  report.thread?.id || "",
                                  report.reply?.id || ""
                                )
                              }
                              size="icon"
                              variant="outline"
                              className="mr-2"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Open in new tab</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="destructive"
                                  disabled={
                                    deletingItemId === report.id ||
                                    (!report.thread && !report.reply)
                                  }
                                >
                                  {report.reply?.id ? (
                                    <MessageSquareX className="h-4 w-4" />
                                  ) : (
                                    <FileX className="h-4 w-4" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete {report.reply?.id ? "Reply" : "Thread"}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action will permanently delete the{" "}
                                    {report.reply?.id ? "reply" : "thread"}{" "}
                                    associated with this report. Are you sure you
                                    want to proceed?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteThreadOrReply(report)
                                    }
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {report.reply?.id
                                ? "Delete Reply"
                                : "Delete Thread"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </LoadingOverlay>
  );
};

export default ReportList;
