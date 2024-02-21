"use client";
import { useState, useEffect } from "react";
import { trpc } from "@/app/_trpc/client";

export default function TodoList() {
  // const {data, isLoading, isError, error} = trpc.powerschool.assignments.useQuery({url: 'https://bcp.instructure.com'})

  // if (isLoading) {
  //     return <div>Loading...</div>;
  // }

  // if (isError) {
  //     return <div>Error: {error.message}</div>;
  // }

  // console.log("assignments", data);

  // const { data, isLoading, isError, error } =
  //   trpc.powerschool.assignmentsWithCourse.useQuery({});

  const { data, isLoading, isError, error } = trpc.powerschool.assignments.useQuery({});

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  console.log("assignments", data);

  return (
    <div>
      {/* {data[2].map((assignment) => (
        <div key={assignment.id}>

            <h2>{assignment.name}</h2>
            <h4>{assignment.due_at}</h4>
            <p>{assignment.description}</p>
            </div>
            )
            )} */}
      hi
    </div>
  );
}
