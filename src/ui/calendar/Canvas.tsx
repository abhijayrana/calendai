"use client";
import React, { useState, useEffect } from "react";
import { trpc } from "@/app/_trpc/client";
import { useUser } from "@clerk/nextjs";
import '../calendar/styles.css'

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
};

// Define types for the props
type AssignmentCardProps = {
  assignment: Assignment; 
  isExpanded: boolean;
  toggleExpand: () => void;
};

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment, isExpanded, toggleExpand }) => {



  // Card styles
  const cardStyles: React.CSSProperties = {
    border: "1px solid black",
    margin: "10px",
    padding: "10px",
    borderRadius: "5px",
    transition: "all 0.3s ease-in-out",
    cursor: "pointer",
    overflow: "hidden", // Ensures content does not flow out of the card
  };

  const {
    title,
    courseName,
    dueDate,
    pointsPossible,
    // priority = 1,
    score,
    description,
  } = assignment;
  
  const estimatedTime = 30; // Replace with actual estimated time

  const priority = 3
  
  // Expanded card styles
  const expandedCardStyles: React.CSSProperties = {
    ...cardStyles,
    maxHeight: "none", // Remove max-height when expanded
    backgroundColor: "#f9f9f9", // Optional: change background color when expanded
  };

  const formattedDueDate = new Date(dueDate).toLocaleDateString()

  const priorityIndicators = ['!', '!!', '!!!'];

  return (
    <div className={`assignment-card ${isExpanded ? 'expanded' : ''}`}>
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
            <button className="priority-button">{priorityIndicators[priority - 1]}</button>
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
              {score !== undefined ? `${score}/${pointsPossible} points` : `-- / ${pointsPossible} points`}
            </p>
          </div>
          <div className="assignment-meta">
          <div className="close-button" onClick={toggleExpand}>X</div>

            <span className="assignment-time editable">{estimatedTime} min</span>
            <div>
            {priorityIndicators.map((indicator, index) => (
              <button
                key={index}
                className={`priority-button ${priority === index + 1 ? 'active' : ''}`}
                onClick={() => {
                  // Call a function to update the priority
                }}
              >
                {indicator}
              </button>
            ))  
            }
            {/* <button className="priority-button">{priorityIndicators[priority - 1]}</button> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function CanvasList() {
  const [visibleAssignments, setVisibleAssignments] = useState<any[]>([]);
  const [displayCount, setDisplayCount] = useState(15);
  const [isEstablished, setIsEstablished] = useState(false);
  const [editMode, setEditMode] = useState(true);

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

  const renderEditableAssignment = (assignment: any) => {
    return (
      <div style={{ marginBottom: "20px" }}>
        {/* Render your form inputs and submit button here, using assignment details to prefill */}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            // Collect form data and call handleEditSubmit
            const updatedDetails = {}; // Collect your form data here
            // handleEditSubmit(assignment.id, updatedDetails);
          }}
        >
          <h2>Edit Assignment</h2>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            defaultValue={assignment.title}
          />
          <br />
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            defaultValue={assignment.description}
          ></textarea>
          <br />
          <label htmlFor="dueDate">Due Date</label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            defaultValue={assignment.dueDate}
          />
          <br />
          <label htmlFor="pointsPossible">Points Possible</label>
          <input
            type="number"
            id="pointsPossible"
            name="pointsPossible"
            defaultValue={assignment.pointsPossible}
          />
          <br />
          <label htmlFor="priority">Priority</label>
          <input
            type="number"
            id="priority"
            name="priority"
            defaultValue={assignment.priority}
          />
          <br />

          <button type="submit">Save Changes</button>
        </form>
      </div>
    );
  };

  return (
    <div style={parentContainerStyles}>
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
        {/* {editMode &&
          visibleAssignments.length > 0 &&
          renderEditableAssignment(visibleAssignments[0])} */}
        {visibleAssignments.map((assignment, index) => (
          <div
            key={index}
          >
            <AssignmentCard key={assignment.id} assignment={assignment} isExpanded={expandedAssignmentId===assignment.id} toggleExpand={() => toggleExpand(assignment.id)}/>
            {/* {!assignment.isMissing && assignment.status == "unsubmitted" && (
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
            )} */}
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
