import type { CourseSummary } from "@/types/course";
import { CourseCard } from "@/components/courses/CourseCard";
import { EmptyState } from "@/components/common/EmptyState";

export function CourseList({
  courses,
  emptyMessage,
}: {
  courses: CourseSummary[];
  emptyMessage: string;
}) {
  if (courses.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <li key={course.id}>
          <CourseCard course={course} />
        </li>
      ))}
    </ul>
  );
}
