"use client"
import { useState, useEffect } from "react";
import { trpc } from "@/app/_trpc/client";

export default function TodoList() {
  const [courses, setCourses] = useState<any[]>([]);

  const { data, isLoading, isError, error } = trpc.powerschool.assignments.useQuery({});

  useEffect(() => {
    if (data) {
      // console.log(data);
      let processingData = data.slice(); // Create a shallow copy of the data array

      for (const course of data) {
        if (!course.assignments || course.assignments.length === 0) {
          // Remove courses without assignments
          processingData = processingData.filter(c => c.id !== course.id);
        } else {
          for (const assignment of course.assignments) {
            let dueDate = assignment.due_at ? new Date(assignment.due_at) : null;
            let sixMonthsBeforeToday = new Date();
            sixMonthsBeforeToday.setMonth(sixMonthsBeforeToday.getMonth() - 6);

            if (!dueDate || dueDate < sixMonthsBeforeToday) {
              // If assignment doesn't meet the criteria, remove it from the course
              processingData = processingData.map(c => {
                if (c.id === course.id) {
                  return {
                    ...c,
                    assignments: c.assignments.filter(a => a.id !== assignment.id)
                  };
                }
                return c;
              });
            }
          }
        }
      }

      setCourses(processingData as any);
    }
  }, [data]); // Dependency array

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  return (
    <div>
      {console.log(courses) }
      {courses.map(course => (
        <div key={course.id}>
          <h1>{course.name}</h1>
          <ul>
            {course.assignments && course.assignments.map(assignment => (
              <li key={assignment.id}>
                <h2>{assignment.name}</h2>
                <p>{assignment.due_at}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
