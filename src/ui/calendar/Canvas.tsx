"use client";
import React, { useState, useEffect } from "react";
import { trpc } from "@/app/_trpc/client";
import { useUser } from "@clerk/nextjs";

export default function TodoList() {
  const [visibleAssignments, setVisibleAssignments] = useState<any[]>([]);
  const [displayCount, setDisplayCount] = useState(15);
  const [isEstablished, setIsEstablished] = useState(false);
  const [forcedSync, setForcedSync] = useState(false);


  const { isLoaded, user } = useUser();

  const {
    data: userInfoData,
    isLoading: userInfoIsLoading,
    isError: userInfoIsError,
    error: userInfoError,
  } = trpc.user.userInfo.useQuery({
    id: user?.id!.toString()!,
  });

  const { data, isLoading, isError, error, refetch } =
    trpc.assignmentsAndGrades.syncAssignments.useQuery(
      {
        id: user!.id,
      },
      { enabled: false }
    );

  const {
    data: fetchedFromDbData,
    isLoading: fetchedFromDbIsLoading,
    isError: fetchedFromDbIsError,
    error: fetchedFromDbError,
    refetch: refetchFromDB,
  } = trpc.assignmentsAndGrades.fetchAssignmentsFromDb.useQuery(undefined, {
    enabled: false,
  });

  useEffect(() => {

    //@ts-ignore
    if (userInfoData && typeof userInfoData.lmsconfig[0]?.syncs === "number") {
      //@ts-ignore
      console.log(userInfoData.lmsconfig[0].syncs);
      //@ts-ignore
      if (userInfoData.lmsconfig[0].syncs == 0) {
        console.log("Syncs is 0, calling initialAssignmentsSyncWithDb");
        refetch(); // Call the initialAssignmentsSyncWithDb if syncs == 0
      }
      //@ts-ignore
      else if (userInfoData.lmsconfig[0].syncs > 0) {
        setIsEstablished(true);
        console.log("Syncs is greater than 0, calling fetchAssignmentsFromDb");
        refetchFromDB(); // Call fetchAssignmentsFromDb if syncs > 0
      }
    }
    //@ts-ignore
  }, [userInfoData, refetch]); // Add userInfoData to the dependency array

  useEffect(() => {
    let sourceData = isEstablished ? fetchedFromDbData : data;
  
    if (sourceData) {
      console.log(sourceData);
  
      const sortedAssignments = sourceData
        .flatMap((course: any) =>
          course.assignments.map((assignment: any) => ({
            ...assignment,
            courseName: course.name || course.title, // Adjust based on your data structure
            dueAtFormatted: new Date(assignment.due_at || assignment.dueDate).toLocaleDateString(),
          }))
        )
        .sort(
          (a: any, b: any) =>
            new Date(a.due_at || a.dueDate).getTime() - new Date(b.due_at || b.dueDate).getTime()
        );
  
      setVisibleAssignments(sortedAssignments.slice(0, displayCount));
    }
  }, [data, fetchedFromDbData, displayCount, isEstablished]); // Add isEstablished to the dependency array

  if (!isLoaded) {
    return <p>Loading...</p>;
  }

  const showMoreAssignments = () => {
    setDisplayCount((prevCount) => prevCount + 15);
  };

  if (userInfoIsLoading) {
    return <p>Loading IsUserSetup...</p>;
  }

  if (userInfoIsError) {
    return <p>Error: {userInfoError.message}</p>;
  }

  if (isLoading && fetchedFromDbIsLoading) {
    return <div>Syncing Grades... </div>;
  }

  if (isLoading && !isEstablished) {
    return <div>Syncing from canvas...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  if (fetchedFromDbIsError) {
    return <div>Error: {fetchedFromDbError.message}</div>;
  }


  if (
    (!data || data.length === 0) &&
    (!fetchedFromDbData || fetchedFromDbData.length === 0)
  ) {
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
        <button
          onClick={() => {
            refetch();

            setIsEstablished(false);
          }}
          style={{ display: isEstablished ? "block" : "none" }}
        >
          Sync
        </button>

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
                <h2>{assignment.title}</h2>
                <p>Unsubmitted</p>
                <p>Due: {assignment.dueAtFormatted}</p>
                <p>Points Possible: {assignment.pointsPossible}</p>
                <p>Course: {assignment.courseName}</p>
              </>
            )}
            {assignment.isMissing && (
              <>
                <h2>{assignment.title} </h2>
                <p>Missing</p>
                <p>Due: {assignment.dueAtFormatted}</p>
                <p>Points Possible: {assignment.pointsPossible}</p>
                <p>Course: {assignment.courseName}</p>
              </>
            )}
            {assignment.status == "submitted" && !assignment.score && (
              <>
                <h2>{assignment.title}</h2>
                <p>Submitted</p>
                <p>Due: {assignment.dueAtFormatted}</p>
                <p>Points: Not graded yet </p>
                <p>Points Possible: {assignment.pointsPossible}</p>
                <p>Course: {assignment.courseName}</p>
              </>
            )}
            {assignment.status == "graded" && assignment.score && (
              <>
                <h2>{assignment.title}</h2>
                <p>Graded</p>
                <p>Due: {assignment.dueAtFormatted}</p>
                <p>Points: {assignment.score}</p>
                <p>Points Possible: {assignment.pointsPossible}</p>
                <p>Course: {assignment.courseName}</p>
              </>
            )}
          </div>
        ))}
        {visibleAssignments.length <
          //@ts-ignore
          (userInfoData?.lmsconfig?.[0]?.syncs === 0
            ? data
            : fetchedFromDbData
          ).flatMap((course: any) => course.assignments).length && (
          <button onClick={showMoreAssignments}>Show More</button>
        )}
      </div>
    </div>
  );
}
