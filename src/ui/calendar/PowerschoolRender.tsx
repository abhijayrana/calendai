import React from "react";
import { trpc } from "@/app/_trpc/client";

type Props = {};

const PowerschoolRender = (props: Props) => {
  const { data, isLoading, error } = trpc.assignmentsAndGrades.getStudentInfo.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  console.log(data);

  return (
    <div>
      <p
        style={{
          fontSize: "1.5rem",
          marginBottom: "20px",
          margin: "10px",
          position: "sticky",
          top: "0",
        }}
      >
        Grades in Powerschool
      </p>
      {/* @ts-ignore */}
      {data.new_grades["23-24"]["S2"].map((course: any, index: number) => (
        <div
          key={index}
          style={{
            margin: "10px",
            padding: "20px",
            borderRadius: "5px",
            backgroundColor: "#fff",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            border: "1px solid #ddd",
          }}
        >
          <p style={{ margin: "0 0 10px 0", fontWeight: "bold" }}>
            {course.class_name}
          </p>
          {course.overall_percent && course.overall_letter ? (
            <p style={{ margin: "0" }}>
              {course.overall_percent}% | {course.overall_letter}
            </p>
          ) : (
            <p style={{ margin: "0" }}>No grade yet</p>
          )}
        </div>
      ))}
    </div>
  );
};
