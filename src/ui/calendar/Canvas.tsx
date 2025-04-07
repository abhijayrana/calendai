"use client";
import React, { useState, useEffect, useRef } from "react";
import { trpc } from "@/app/_trpc/client";
import { useUser } from "@clerk/nextjs";
import "../calendar/styles.css";

const parentContainerStyles: React.CSSProperties = {
  position: "relative", // This establishes a new positioning context
  // ... other styles for the parent container
};

// Define a type for the assignment object
type Assignment = {
  id: string;
  title: string;
  courseName: string;
  dueDate: string;
  pointsPossible: number;
  priority?: number;
  status: "unsubmitted" | "submitted" | "graded";
  description?: string;
  score?: number;
  estimatedTime?: number;
};

// Define types for the props
type AssignmentCardProps = {
  assignment: Assignment;
  isExpanded: boolean;
  toggleExpand: () => void;
  user: any;
};

const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  isExpanded,
  toggleExpand,
  user,
}) => {
  const { title, courseName, dueDate, score, description } = assignment;

  const [priority, setPriority] = useState(assignment.priority || 2);
  const [estimatedTime, setEstimatedTime] = useState(
    assignment.estimatedTime || 0
  );
  const [status, setStatus] = useState(assignment.status || "unsubmitted");
  const [pointsPossible, setPointsPossible] = useState(
    assignment.pointsPossible
  );

  const editAssignment = trpc.assignmentsAndGrades.edit.useMutation();

  const handlePriorityChange = (newPriority: number) => {
    setPriority(newPriority);
    editAssignment.mutate({
      id: assignment.id,
      priority: newPriority,
      userClerkId: user.id, // Add the user's clerkAuthId
    });
  };

  const handleEstimatedTimeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newEstimatedTime = parseInt(e.target.value);
    setEstimatedTime(newEstimatedTime);
    editAssignment.mutate({
      id: assignment.id,
      estimatedTime: newEstimatedTime,
      userClerkId: user.id, // Add the user's clerkAuthId
    });
  };

  const handleStatusChange = (
    newStatus: "unsubmitted" | "submitted" | "graded"
  ) => {
    setStatus(newStatus);
    editAssignment.mutate({
      id: assignment.id,
      status: newStatus,
      userClerkId: user.id, // Add the user's clerkAuthId
    });
  };

  const handlePointsPossibleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newPointsPossible = parseFloat(e.target.value);
    setPointsPossible(newPointsPossible);
    editAssignment.mutate({
      id: assignment.id,
      pointsPossible: newPointsPossible,
      userClerkId: user.id, // Add the user's clerkAuthId
    });
  };
  const formattedDueDate = new Date(dueDate).toLocaleDateString();

  const priorityIndicators = ["!", "!!", "!!!"];

  return (
    <div className={`assignment-card ${isExpanded ? "expanded" : ""}`}>
      {!isExpanded ? (
        // The card is only clickable when it's not expanded.
        <div className="assignment-content" onClick={toggleExpand}>
          <div className="assignment-text">
            <h3 className="assignment-title">{title}</h3>
            <p className="assignment-course">{courseName}</p>
            <p className="assignment-due">Due: {formattedDueDate}</p>
          </div>
          <div className="assignment-meta">
            <span className="assignment-time">{estimatedTime} min</span>
            <button className="priority-button">
              {priorityIndicators[priority - 1]}
            </button>
          </div>
        </div>
      ) : (
        // When the card is expanded, the entire content is not clickable.
        // The 'X' button is used to collapse the card.
        <div className="assignment-content">
          <div className="assignment-text">
            <h3 className="assignment-title">{title}</h3>
            <p className="assignment-course">{courseName}</p>
            <p className="assignment-due">Due: {formattedDueDate}</p>
            <p className="assignment-points">
              <>
                {score !== null ? <span>{score}</span> : <span>--</span>}
                {" / "}
                {assignment.status === "unsubmitted" ? (
                  <input
                    type="number"
                    value={pointsPossible !== null ? pointsPossible : "--"}
                    onChange={handlePointsPossibleChange}
                    className="input-right-aligned"
                    style={{ width: "60px" }}
                  />
                ) : (
                  <span>{pointsPossible !== null ? pointsPossible : "--"}</span>
                )}
                {" points"}
              </>
            </p>
          </div>
          <div className="assignment-meta">
            <div className="close-button" onClick={toggleExpand}>
              X
            </div>

            <div style={{ display: "flex", alignItems: "center" }}>
              <input
                type="number"
                value={estimatedTime}
                onChange={handleEstimatedTimeChange}
                className="input-right-aligned"
                style={{ flexGrow: 1 }}
              />
              <span style={{ marginLeft: "4px" }}>mins</span>
            </div>
            <div className="priority-button-container">
              {priorityIndicators.map((indicator, index) => (
                <button
                  key={index}
                  className={`priority-button ${
                    priority === index + 1 ? "active" : ""
                  }`}
                  onClick={() => handlePriorityChange(index + 1)}
                >
                  {indicator}
                </button>
              ))}
            </div>
            <select
              value={status}
              onChange={(e) =>
                handleStatusChange(
                  e.target.value as "unsubmitted" | "submitted" | "graded"
                )
              }
            >
              <option value="unsubmitted">Unsubmitted</option>
              <option value="submitted">Submitted</option>
              <option value="graded">Graded</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default function CanvasList() {
  const [visibleAssignments, setVisibleAssignments] = useState<any[]>([]);
  const [isEstablished, setIsEstablished] = useState(false);

  const assignmentListRef = useRef<HTMLDivElement>(null);

  const [expandedAssignmentId, setExpandedAssignmentId] = useState<
    string | null
  >(null);

  const toggleExpand = (id: string) => {
    if (expandedAssignmentId === id) {
      setExpandedAssignmentId(null); // collapse if it's the same
    } else {
      setExpandedAssignmentId(id); // expand the new one
    }
  };

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
    data: forcedPriorityData,
    isLoading: forcedPriorityIsLoading,
    isError: forcedPriorityIsError,
    error: forcedPriorityError,
    refetch: refetchPriority,
  } = trpc.assignmentsAndGrades.forceUpdatePrioAndTime.useQuery(undefined, {
    enabled: false,
  });

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
            courseName: course.name || course.title,
            dueAtFormatted: new Date(
              assignment.due_at || assignment.dueDate
            ).toLocaleDateString(),
          }))
        )
        .sort(
          (a: any, b: any) =>
            new Date(a.due_at || a.dueDate).getTime() -
            new Date(b.due_at || b.dueDate).getTime()
        );

      setVisibleAssignments(sortedAssignments);
    }
  }, [data, fetchedFromDbData, isEstablished]);

  useEffect(() => {
    if (assignmentListRef.current) {
      const today = new Date().toISOString().slice(0, 10);
      const firstAssignmentDueToday = visibleAssignments.findIndex(
        (assignment) =>
          new Date(assignment.due_at || assignment.dueDate)
            .toISOString()
            .slice(0, 10) >= today
      );

      if (firstAssignmentDueToday !== -1) {
        assignmentListRef.current.children[
          firstAssignmentDueToday
        ].scrollIntoView({
          behavior: "auto",
          block: "start",
        });
      }
    }
  }, [visibleAssignments]);

  useEffect(() => {
    if (forcedPriorityData) {
      console.log("forcedPriorityData", forcedPriorityData);
      refetch();
    }
  }, [forcedPriorityData, refetch]);

  if (!isLoaded) {
    return <p>Loading...</p>;
  }

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
    <div style={parentContainerStyles}>
      <div
        style={{
          position: "sticky",
          top: "0",
          backgroundColor: "white",
          zIndex: 1,
          padding: "10px",
        }}
      >
        <p
          style={{
            fontSize: "1.5rem",
            margin: "0",
          }}
        >
          Canvas Assignments
        </p>
      </div>

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
        <button
          onClick={() => {
            refetchPriority();
          }}
          style={{ display: isEstablished ? "block" : "none" }}
        >
          Force Update
        </button>
        <div
          style={{
            maxHeight: "calc(90vh - 80px)", // Adjust the height based on your layout
            overflowY: "auto",
          }}
        >
          <div ref={assignmentListRef}>
            {visibleAssignments.map((assignment, index) => (
              <div key={index}>
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  isExpanded={expandedAssignmentId === assignment.id}
                  toggleExpand={() => toggleExpand(assignment.id)}
                  user={user}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
