import prisma from "@database/prisma";
import { auth } from "@clerk/nextjs";
import { feedAssignmentToLLM, extractEstimatedTime, extractPriorityLevel } from "../llm/llm-helpers";

export async function addOrUpdateCourseWithAssignments(data) {
  const { canvasCourseId, name, assignments } = data;

  const { userId } = auth();

  let course = await prisma.course.upsert({
    where: {
      canvasCourseId,
    },
    update: {},
    create: {
      canvasCourseId,
      title: name,
    },
  });

  let user = await prisma.user.findUnique({
    where: {
      clerkAuthId: userId,
    },
  });

  const prismaId = user.id;

  await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: prismaId,
        courseId: course.id,
      },
    },
    update: {},
    create: {
      userId: prismaId,
      courseId: course.id,
    },
  });

  for (let assignment of assignments) {
    const existingAssignment = await prisma.assignment.findUnique({
      where: {
        id: assignment.id,
      },
    });

    if (!existingAssignment) {
      // If the assignment is not in the database, call the OpenAI API and add it with priority and estimatedTime
      const prompt = `
        Assignment Title: ${assignment.title}
        Description: ${assignment.description}
        Due Date: ${assignment.dueDate}
        Points Possible: ${assignment.points_possible}
      `;

      const llmOutput = await feedAssignmentToLLM(prompt);
      const priority = extractPriorityLevel(llmOutput);
      const estimatedTime = extractEstimatedTime(llmOutput);

      await prisma.assignment.create({
        data: {
          id: assignment.id,
          title: assignment.title,
          description: assignment.description,
          dueDate: new Date(assignment.dueDate),
          priority,
          courseId: course.id,
          score: assignment.score,
          grade: assignment.grade,
          status: assignment.status,
          pointsPossible: assignment.points_possible,
          isMissing: assignment.isMissing,
          estimatedTime,
        },
      });
    } else if (!existingAssignment.priority || !existingAssignment.estimatedTime) {
      // If the assignment is in the database but doesn't have priority and estimatedTime, call the OpenAI API and update it
      const prompt = `
        Assignment Title: ${existingAssignment.title}
        Description: ${existingAssignment.description}
        Due Date: ${existingAssignment.dueDate}
        Points Possible: ${existingAssignment.pointsPossible}
      `;

      const llmOutput = await feedAssignmentToLLM(prompt);
      const priority = extractPriorityLevel(llmOutput);
      const estimatedTime = extractEstimatedTime(llmOutput);

      await prisma.assignment.update({
        where: {
          id: assignment.id,
        },
        data: {
          priority,
          estimatedTime,
        },
      });
    } else {
      // If the assignment is already in the database and has priority and estimatedTime, just update other fields
      await prisma.assignment.update({
        where: {
          id: assignment.id,
        },
        data: {
          title: assignment.title,
          description: assignment.description,
          dueDate: new Date(assignment.dueDate),
          score: assignment.score,
          grade: assignment.grade,
          status: assignment.status,
          pointsPossible: assignment.points_possible,
          isMissing: assignment.isMissing,
        },
      });
    }
  }

  return "done";
}

async function createEditForUser(assignment, userId) {
  // Call the LLM API to generate priority and estimated time
  const llmInput = `Assignment Title: ${assignment.title}\nDescription: ${assignment.description}\nDue Date: ${assignment.dueDate}\n\nGenerate the priority level (1-3) and estimated time to finish this assignment:`;
  const llmOutput = await feedAssignmentToLLM(llmInput);

  // Process the LLM output and extract the generated values
  const priorityLevel = extractPriorityLevel(llmOutput);
  const estimatedTime = extractEstimatedTime(llmOutput);

  // Create an edit for the user with the entire assignment object and generated values
  await prisma.edit.create({
    data: {
      assignmentId: assignment.id,
      userId,
      grade: assignment.grade,
      status: assignment.status,
      priority: priorityLevel,
      dueDate: assignment.dueDate,
      completed: false,
      estimatedTime,
      pointsPossible: assignment.pointsPossible,
    },
  });
}

export async function fetchAssignmentsAndCourses() {
  const { userId } = auth();

  try {
    const userWithCoursesAndAssignments = await prisma.user.findUnique({
      where: {
        clerkAuthId: userId,
      },
      include: {
        enrollments: {
          include: {
            course: {
              include: {
                assignments: true, // Include assignments for each course
              },
            },
          },
        },
      },
    });

    // Transform the data structure to an array of courses with assignments
    const courses = userWithCoursesAndAssignments.enrollments.map(
      (enrollment) => ({
        ...enrollment.course,
        assignments: enrollment.course.assignments,
      })
    );

    return courses;
  } catch (error) {
    console.error("Failed to fetch user courses and assignments:", error);
    throw error; // Rethrow or handle as needed
  }
}

export async function createOrUpdateEdit({
  assignmentId,
  editData: { priority, score, grade, status, dueDate },
}) {
  const { userId } = auth();
  const existingEdit = await prisma.edit.findUnique({
    where: {
      userId_assignmentId: {
        userId: userId,
        assignmentId: assignmentId,
      },
    },
  });

  if (existingEdit) {
    return await prisma.edit.update({
      where: {
        id: existingEdit.id,
      },
      data: editData,
    });
  } else {
    return await prisma.edit.create({
      data: {
        userId: userId,
        assignmentId: assignmentId,
        ...editData,
      },
    });
  }
}

export async function fetchEdits() {
  const { userId } = auth();

  const edits = await prisma.edit.findMany({
    where: {
      userId: userId,
    },
    course: true,
  });

  return assignments.map((assignment) => {
    const userEdit = assignment.edits.find((edit) => edit.userId === userId);
    return {
      ...assignment,
      // Override fields from assignment with fields from userEdit if they exist
      priority: userEdit?.priority ?? assignment.priority,
      dueDate: userEdit?.dueDate ?? assignment.dueDate,
      completed: userEdit?.completed ?? false, // Assuming 'completed' is not a field in Assignment but you want to track it per user
    };
  });
}
