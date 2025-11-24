import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import CourseLearningViewer from "./CourseLearningViewer";
import { courseService } from "@/services/course/courseService";
import type { CourseDetail, Topic } from "@/types/course";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Clock,
  BookOpen,
  Users,
  Star,
  CheckCircle2,
  Layers,
  Globe,
  User,
  Loader2,
} from "lucide-react";

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [submissionId] = useState<string | null>(
    location.state?.submissionId || null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // --- NEW STATE FOR REVIEW MODE ---
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewData, setReviewData] = useState<CourseDetail | null>(null);
  const [loadingReview, setLoadingReview] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError(false);
        const data = await courseService.getCourseDetail(id);
        setCourse(data);
      } catch (err) {
        console.error("Failed to fetch course:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  // --- NEW HANDLER ---
  const handleReviewCourse = async () => {
    if (!id) return;
    try {
      setLoadingReview(true);
      // Call the new service method
      const fullCourseData = await courseService.getCourseContent(id);
      setReviewData(fullCourseData);
      setIsReviewing(true);
    } catch (err) {
      console.error("Failed to load course content", err);
      // Optional: Add toast error here
    } finally {
      setLoadingReview(false);
    }
  };

  // Memoized learning outcomes
  const learningOutcomes = useMemo(() => {
    if (!course?.learningOutcome) return [];
    return course.learningOutcome
      .split(/\.\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [course?.learningOutcome]);

  // --- CONDITIONAL RENDERING ---
  // If in review mode and we have data, show the learning viewer
  if (isReviewing && reviewData) {
    return (
      <CourseLearningViewer
        course={reviewData}
        submissionId={submissionId || ""}
        onExit={() => setIsReviewing(false)}
      />
    );
  }

  if (loading) return <CourseDetailSkeleton />;
  if (error || !course) return <CourseNotFound onBack={() => navigate(-1)} />;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 gap-2 hover:gap-3 transition-all cursor-pointer"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </Button>
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12">
          <div className="lg:col-span-2 space-y-10">
            <section aria-labelledby="course-title">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <Badge variant="secondary" className="font-medium">
                    {course.program.name}
                  </Badge>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground font-medium">
                    {course.program.level.name}
                  </span>
                </div>
                <h1
                  id="course-title"
                  className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground"
                >
                  {course.title}
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
                  {course.description}
                </p>
                <div className="flex flex-wrap gap-3 pt-4">
                  <Badge variant="outline" className="gap-1.5 font-sans">
                    <Globe className="w-3.5 h-3.5" />
                    {course.language}
                  </Badge>
                  <Badge variant="outline" className="gap-1.5 font-sans">
                    <Users className="w-3.5 h-3.5" />
                    {course.learnerCount.toLocaleString()} learners
                  </Badge>
                  <Badge variant="outline" className="gap-1.5 font-sans">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    {course.averageRating}
                  </Badge>
                </div>
              </div>
            </section>

            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center gap-4 pb-4">
                <img
                  src={course.teacher.avatar}
                  alt={course.teacher.name}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/10"
                />
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="font-sans">Teacher</span>
                  </CardTitle>
                  <p className="font-sans text-sm text-muted-foreground">
                    {course.teacher.name}
                  </p>
                  <p className="font-sans text-xs text-muted-foreground/80">
                    {course.teacher.email}
                  </p>
                </div>
              </CardHeader>
            </Card>

            <Tabs defaultValue="curriculum" className="w-full font-sans">
              <TabsList className="grid w-full grid-cols-3 h-12 ">
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
                <TabsTrigger value="topics">Topics</TabsTrigger>
              </TabsList>

              <TabsContent value="curriculum" className="mt-6">
                <CourseCurriculum units={course.units} />
              </TabsContent>

              <TabsContent value="outcomes" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>What You'll Achieve</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {learningOutcomes.map((outcome, idx) => (
                      <div key={idx} className="flex gap-3 items-start">
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        <p className="text-foreground leading-relaxed">
                          {outcome}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="topics" className="mt-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  {course.topics?.map((topic) => (
                    <TopicCard key={topic.topicId} topic={topic} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              <CourseSidebar
                course={course}
                onReview={handleReviewCourse}
                isReviewLoading={loadingReview}
              />
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}

function CourseCurriculum({ units }: { units: CourseDetail["units"] }) {
  if (!units?.length)
    return <p className="text-muted-foreground">No units available.</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold">Course Content</h3>
        <p className="text-sm text-muted-foreground">
          {units.length} Units •{" "}
          {units.reduce((acc, u) => acc + u.totalLessons, 0)} Lessons
        </p>
      </div>

      {units.map((unit) => (
        <Card
          key={unit.courseUnitID}
          className="hover:shadow-md transition-shadow"
        >
          <CardHeader className="bg-muted/30">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-lg">
                  Unit {unit.position}: {unit.title}
                </h4>
                {unit.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {unit.description}
                  </p>
                )}
              </div>
              <Badge variant="secondary">{unit.totalLessons} lessons</Badge>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

function TopicCard({ topic }: { topic: Topic }) {
  return (
    <Card className="overflow-hidden hover:ring-2 hover:ring-primary/20 transition-all">
      <img
        src={topic.imageUrl}
        alt={topic.topicName}
        className="w-full h-40 object-cover"
      />
      <CardContent className="p-5">
        <h4 className="font-semibold text-lg mb-2">{topic.topicName}</h4>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {topic.topicDescription}
        </p>
      </CardContent>
    </Card>
  );
}

function CourseSidebar({
  course,
  onReview,
  isReviewLoading,
}: {
  course: CourseDetail;
  onReview: () => void;
  isReviewLoading: boolean;
}) {
  return (
    <Card className="overflow-hidden shadow-xl border-0 font-sans">
      <div className="relative group aspect-video bg-gray-900">
        <img
          src={course.imageUrl}
          alt={course.title}
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-2">
          <p className="text-4xl font-semibold text-primary">
            {course.price === 0 ? "Free" : `đ${course.price.toLocaleString()}`}
          </p>
        </div>

        <Separator />

        <div className="space-y-4 text-sm">
          <div className="flex justify-between">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" /> Duration
            </span>
            <span className="font-medium">{course.estimatedHours} hours</span>
          </div>
          <div className="flex justify-between">
            <span className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="w-4 h-4" /> Lessons
            </span>
            <span className="font-medium">{course.numLessons}</span>
          </div>
          <div className="flex justify-between">
            <span className="flex items-center gap-2 thai-muted-foreground">
              <Layers className="w-4 h-4" /> Level
            </span>
            <span className="font-medium">{course.program.level.name}</span>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full h-12 text-lg font-semibold
                  bg-blue-600 hover:bg-blue-500
                  text-white cursor-pointer"
          onClick={onReview}
          disabled={isReviewLoading}
        >
          {isReviewLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading Content...
            </>
          ) : (
            <span className="text-white">Review Course</span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

function CourseDetailSkeleton() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <Skeleton className="h-10 w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div>
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function CourseNotFound({ onBack }: { onBack: () => void }) {
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <h2 className="text-2xl font-bold">Course Not Found</h2>
        <p className="text-muted-foreground max-w-md">
          The course you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={onBack} className="cursor-pointer">
          <ArrowLeft className="w-4 h-4 mr-2 " />
          Back to Courses
        </Button>
      </div>
    </DashboardLayout>
  );
}
