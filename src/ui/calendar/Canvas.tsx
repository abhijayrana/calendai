"use client";
import React, { useState, useEffect } from "react";
import { trpc } from "@/app/_trpc/client";
import { useUser } from "@clerk/nextjs";

export default function TodoList() {
  const [visibleAssignments, setVisibleAssignments] = useState<any[]>([]);
  const [displayCount, setDisplayCount] = useState(15);
  const [isEstablished, setIsEstablished] = useState(false);

  const { isLoaded, user } = useUser();

  if(!isLoaded) {
    return <p>Loading...</p>

  }

  const {data: userInfoData, isLoading: userInfoIsLoading, isError: userInfoIsError, error: userInfoError} = trpc.user.userInfo.useQuery({
    id: user?.id!.toString()!
  });

  const { data, isLoading, isError, error, refetch } =
    trpc.assignmentsAndGrades.initialAssignmentsSyncWithDb.useQuery({
      id: user!.id,
    }, {enabled: false});

  
    useEffect(() => {

      // Ensure userInfoData and its properties are loaded and defined before accessing syncs
      //@ts-ignore
      if (userInfoData && typeof userInfoData.lmsconfig[0]?.syncs === 'number') {
        //@ts-ignore
        if (userInfoData.lmsconfig[0].syncs === 0) {
          console.log("Syncs is 0, calling initialAssignmentsSyncWithDb");
          refetch(); // Call the initialAssignmentsSyncWithDb if syncs == 0
        } 
        //@ts-ignore
        else if (userInfoData.lmsconfig[0].syncs > 0) {
          // Perform some other action if syncs > 0
          setIsEstablished(true);
          console.log("Performing an alternative action because syncs > 0");
          // Placeholder for other logic
        }
      }
      //@ts-ignore
    }, [userInfoData, refetch]); // Add userInfoData to the dependency array

    

  useEffect(() => {
    if (data) {
      console.log(data);

      const sortedAssignments = data
        //@ts-ignore
        .flatMap((course: any) =>
          course.assignments.map((assignment: any) => ({
            ...assignment,
            courseName: course.name,
            dueAtFormatted: new Date(assignment.due_at).toLocaleDateString(),
          }))
        )
        .sort(
          (a: any, b: any) =>
            new Date(a.due_at).getTime() - new Date(b.due_at).getTime()
        );

      setVisibleAssignments(sortedAssignments.slice(0, displayCount));
    }
  }, [data, displayCount]);

  const showMoreAssignments = () => {
    setDisplayCount((prevCount) => prevCount + 15);
  };

  if (isLoading) {
    return <div>Syncing Grades...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  //@ts-ignore

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
            {!assignment.isMissing && assignment.status == "unsubmitted" && (
              <>
                <h2>{assignment.name} 1</h2>
                <p>Due: {assignment.dueAtFormatted}</p>
                <p>Points Possible: {assignment.points_possible}</p>
                <p>Course: {assignment.courseName}</p>
              </>
            )}
            {assignment.isMissing && (
              <>
                <h2>[MISSING] {assignment.name} 2</h2>
                <p>Due: {assignment.dueAtFormatted}</p>
                <p>Points Possible: {assignment.points_possible}</p>
                <p>Course: {assignment.courseName}</p>
              </>
            )}
            {assignment.status == "submitted" && !assignment.score && (
              <>
                <h2>{assignment.name} 3</h2>
                <p>Due: {assignment.dueAtFormatted}</p>
                <p>Points: Not graded yet </p>
                <p>Points Possible: {assignment.points_possible}</p>
                <p>Course: {assignment.courseName}</p>
              </>
            )}
            {assignment.status == "graded" && assignment.score && (
              <>
                <h2>{assignment.name} 4</h2>
                <p>Due: {assignment.dueAtFormatted}</p>
                <p>Points: {assignment.score}</p>
                <p>Points Possible: {assignment.points_possible}</p>
                <p>Course: {assignment.courseName}</p>
              </>
            )}
          </div>
        ))}
        {visibleAssignments.length <
          //@ts-ignore
          data.flatMap((course: any) => course.assignments).length && (
          <button onClick={showMoreAssignments}>Show More</button>
        )}
      </div>
    </div>
  );
}
