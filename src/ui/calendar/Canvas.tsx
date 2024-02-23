"use client";
import React, { useState, useEffect } from "react";
import { trpc } from "@/app/_trpc/client";

export default function TodoList() {
  const [visibleAssignments, setVisibleAssignments] = useState<any[]>([]);
  const [displayCount, setDisplayCount] = useState(15);

  const { data, isLoading, isError, error } =
    trpc.assignmentsAndGrades.assignments.useQuery({});

  useEffect(() => {
    if (data) {
      // Flatten, sort assignments, and initially display only the first 15
      const sortedAssignments = data
        .flatMap((course:any) =>
          course.assignments.map((assignment:any) => ({
            ...assignment,
            courseName: course.name,
            dueAtFormatted: new Date(assignment.due_at).toLocaleDateString(),
          }))
        )
        .sort((a:any, b:any) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());

      setVisibleAssignments(sortedAssignments.slice(0, displayCount));
    }
  }, [data, displayCount]);

  const showMoreAssignments = () => {
    setDisplayCount((prevCount) => prevCount + 15);
  };

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
      <p
        style={{
          fontSize: "1.5rem",
          margin: "10px",
          position: "sticky",
          top: "0",
        }}
      >
        Canvas Assignments
      </p>

      <div style={{ marginTop: "20px" }}>
        {visibleAssignments.map((assignment, index) => (
          <div
            key={index}
            style={{
              border: "1px solid black",
              margin: "10px",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            <h2>{assignment.name}</h2>
            <p>Due: {assignment.dueAtFormatted}</p>
            <p>Points: {assignment.points_possible}</p>
            <p>Course: {assignment.courseName}</p>
          </div>
        ))}
        {visibleAssignments.length <
          data.flatMap((course:any) => course.assignments).length && (
          <button onClick={showMoreAssignments}>Show More</button>
        )}
      </div>
    </div>
  );
}
