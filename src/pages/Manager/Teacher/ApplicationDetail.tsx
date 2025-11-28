import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  XCircle,
  Video,
  AlertCircle,
  User,
  Calendar,
  Globe,
  Award,
  Briefcase,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  applicationService,
  type TeacherApplication,
} from "@/services/teacher/applicationService";
import { Toaster } from "sonner";
import { toast } from "react-toastify";

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [application, setApplication] = useState<TeacherApplication | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await applicationService.getApplicationById(id);
        setApplication(data);
      } catch (err) {
        setError("Failed to load application details.");
        console.error(err);
        toast.error("Failed to load application details.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd MMM yyyy, HH:mm");
    } catch {
      return dateStr;
    }
  };

  const handleApprove = async () => {
    if (!application) return;
    setActionLoading(true);
    try {
      await applicationService.approveApplication(application.applicationID);
      // Optimistic update
      setApplication({
        ...application,
        status: "Approved",
        reviewedAt: new Date().toISOString(),
      });
      setIsApproveOpen(false);
      toast.success("Application approved successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve application. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!application) return;
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }
    setActionLoading(true);
    try {
      await applicationService.rejectApplication(
        application.applicationID,
        rejectionReason
      );
      // Optimistic update
      setApplication({
        ...application,
        status: "Rejected",
        rejectionReason: rejectionReason,
        reviewedAt: new Date().toISOString(),
      });
      setIsRejectOpen(false);
      toast.success("Application rejected successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to reject application. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return {
          variant: "default" as const,
          icon: CheckCircle2,
          color: "text-green-700 bg-green-100 border-green-200",
        };
      case "Rejected":
        return {
          variant: "destructive" as const,
          icon: XCircle,
          color: "text-red-700 bg-red-100 border-red-200",
        };
      default:
        return {
          variant: "secondary" as const,
          icon: Clock,
          color: "text-yellow-700 bg-yellow-100 border-yellow-200",
        };
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-white">
          <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
            <Skeleton className="h-10 w-64" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-48 rounded-lg" />
                <Skeleton className="h-80 rounded-lg" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-40 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !application) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-screen bg-white">
          <div className="text-center space-y-4 p-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Application Not Found
            </h2>
            <p className="text-gray-600 max-w-md">
              {error ||
                "The application may have been removed or the link is invalid."}
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Applications
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const status = getStatusBadge(application.status);
  const StatusIcon = status.icon;

  return (
    <DashboardLayout>
      <Toaster position="top-left" />
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12 space-y-8">
          <Button
            variant="ghost"
            size="sm"
            className="mb-6 gap-2 hover:gap-3 transition-all cursor-pointer"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Applications
          </Button>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-3">
            <div className="p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-start gap-4 flex-1">
                  <Avatar className="w-20 h-20 border-2 border-gray-200">
                    <AvatarImage
                      src={application.avatar}
                      alt={application.fullName}
                    />
                    <AvatarFallback className="text-lg font-semibold bg-gray-100 text-gray-900">
                      {application.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-4 flex-1">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-1">
                        {application.fullName}
                      </h1>
                      <p className="text-gray-600 font-medium">
                        Teacher Application
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700 truncate">
                          {application.email}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">
                          {application.phoneNumber}
                        </span>
                      </div>
                    </div>
                    {application.meetingUrl && (
                      <div className="text-sm flex items-center gap-2">
                        <Video className="w-5 h-5 text-gray-600" />
                        <a
                          href={application.meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline break-all hover:text-blue-700"
                        >
                          {application.meetingUrl}
                        </a>
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge
                        className={`${status.color} px-3 py-1 font-medium`}
                      >
                        <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
                        {application.status}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-gray-300 px-3 py-1 font-medium"
                      >
                        <Globe className="w-3.5 h-3.5 mr-1.5 text-gray-600" />
                        {application.language} • {application.proficiencyCode}
                      </Badge>
                    </div>
                  </div>
                </div>

                {application.status === "Pending" && (
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:min-w-[160px]">
                    <Button
                      size="lg"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => setIsApproveOpen(true)}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => {
                        setRejectionReason("");
                        setIsRejectOpen(true);
                      }}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-gray-200 rounded-lg shadow-sm">
                <CardHeader className="border-b border-gray-100 pb-4">
                  <CardTitle className="flex items-center gap-3 text-gray-900 text-lg">
                    <User className="w-5 h-5 text-gray-600" />
                    Personal Statement
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {application.bio || (
                        <span className="text-gray-400 italic">
                          No personal statement provided.
                        </span>
                      )}
                    </p>
                  </div>

                  <Separator className="bg-gray-100" />

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm">
                        <Briefcase className="w-4 h-4 text-gray-600" />
                        Teaching Experience
                      </div>
                      <p className="text-gray-600 leading-relaxed text-sm">
                        {application.teachingExperience || "Not provided"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 font-medium">
                          Date of Birth
                        </span>
                        <span className="text-gray-900 font-semibold">
                          {application.dateOfBirth}
                        </span>
                      </div>
                      <Separator className="bg-gray-200" />
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 font-medium">
                          Submitted
                        </span>
                        <span className="text-gray-900 font-semibold">
                          {formatDate(application.submittedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 rounded-lg shadow-sm">
                <CardHeader className="border-b border-gray-100 pb-4">
                  <CardTitle className="flex items-center gap-3 text-gray-900 text-lg">
                    <Award className="w-5 h-5 text-gray-600" />
                    Certificates
                    <Badge
                      variant="secondary"
                      className="ml-auto bg-gray-100 text-gray-700"
                    >
                      {application.certificates.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {application.certificates.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {application.certificates.map((cert) => (
                        <div
                          key={cert.id}
                          className="group relative border border-gray-200 rounded-md overflow-hidden cursor-pointer hover:border-gray-400 transition-all"
                          onClick={() =>
                            setSelectedImage(cert.certificateImageUrl)
                          }
                        >
                          <div className="aspect-video bg-gray-100 relative overflow-hidden">
                            <img
                              src={cert.certificateImageUrl}
                              alt={cert.certificateName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="p-3 bg-white">
                            <p className="font-semibold text-sm text-gray-900 truncate">
                              {cert.certificateName}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Alert className="border-gray-200 bg-gray-50">
                      <AlertCircle className="h-4 w-4 text-gray-600" />
                      <AlertDescription className="text-gray-600">
                        No certificates uploaded yet.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-gray-200 rounded-lg shadow-sm">
                <CardHeader className="border-b border-gray-100 pb-4">
                  <CardTitle className="text-base flex items-center gap-2 text-gray-900">
                    <Clock className="w-4 h-4 text-gray-600" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900">
                        Application Submitted
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(application.submittedAt)}
                      </p>
                    </div>
                  </div>

                  {application.status !== "Pending" &&
                    (application.reviewedAt || application.status) && (
                      <>
                        <div className="relative pl-5">
                          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
                        </div>
                        <div className="flex gap-4">
                          <div
                            className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${
                              application.status === "Approved"
                                ? "bg-green-100"
                                : "bg-red-100"
                            }`}
                          >
                            <StatusIcon
                              className={`w-4 h-4 ${
                                application.status === "Approved"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-gray-900">
                              {application.status}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {application.reviewedAt
                                ? formatDate(application.reviewedAt)
                                : "Just now"}
                            </p>
                            {application.reviewer && (
                              <p className="text-xs text-gray-500 mt-1">
                                by {application.reviewer.fullName}
                              </p>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                  {application.rejectionReason && (
                    <Alert
                      variant="destructive"
                      className="mt-4 border-red-200 bg-red-50"
                    >
                      <AlertDescription className="text-xs text-red-700">
                        {application.rejectionReason}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Image Dialog */}
          <Dialog
            open={!!selectedImage}
            onOpenChange={() => setSelectedImage(null)}
          >
            <DialogContent className="max-w-5xl p-0 overflow-hidden bg-white border border-gray-200">
              <DialogHeader className="absolute right-4 top-4 z-10"></DialogHeader>
              {selectedImage && (
                <div className="flex items-center justify-center p-4">
                  <img
                    src={selectedImage}
                    alt="Certificate full view"
                    className="max-w-full max-h-[90vh] object-contain rounded-md"
                  />
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Approve Confirmation Dialog */}
          <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
            <DialogContent className="sm:max-w-[425px] bg-white">
              <DialogHeader>
                <DialogTitle>Approve Application</DialogTitle>
                <DialogDescription>
                  Are you sure you want to approve this teacher application?
                  This action will grant the user teacher privileges.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => setIsApproveOpen(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <div></div>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleApprove}
                  disabled={actionLoading}
                >
                  {actionLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Confirm Approve
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Reject Confirmation Dialog */}
          <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
            <DialogContent className="sm:max-w-[500px] bg-white">
              <DialogHeader>
                <DialogTitle>Reject Application</DialogTitle>
                <DialogDescription>
                  Are you sure you want to reject this teacher application? This
                  action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="reason" className="text-right mb-2 block">
                  Rejection Reason <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Please provide a reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => setIsRejectOpen(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <div></div>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={actionLoading}
                >
                  {actionLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Confirm Reject
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </DashboardLayout>
  );
}
