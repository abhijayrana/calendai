import prisma from "@database/prisma"
import { auth } from "@clerk/nextjs";

export async function addOrUpdateCourseWithAssignments(data) {
    const {canvasCourseId, name, assignments} = data;

    const {userId} = auth();

    let course = await prisma.course.upsert({
        where: {
           canvasCourseId 
        },
        update: {},
        create: {
            canvasCourseId,
            title: name,
        }

    })

    let user = await prisma.user.findUnique({
        where: {
            clerkAuthId: userId
        }
    })

    const prismaId = user.id;

    await prisma.enrollment.upsert({
        where: {
            userId_courseId: {
                userId: prismaId,
                courseId: course.id
            }
        },
        update: {},
        create: {
            userId: prismaId,
            courseId: course.id
        }
    })

    for (let assignment of assignments) {
        await prisma.assignment.upsert({
            where: {
                id: assignment.id
            },
            update:{
                title: assignment.title,
                description: assignment.description,
                dueDate: new Date(assignment.dueDate),
                priority: assignment.priority,
                score: assignment.score,
                grade: assignment.grade,
                status: assignment.status,
                isMissing: assignment.isMissing,
                pointsPossible: assignment.points_possible,
            },
            create: {
                id: assignment.id,
                title: assignment.title,
                description: assignment.description,
                dueDate: new Date(assignment.dueDate),
                priority: assignment.priority,
                courseId: course.id, // Associate with the course
                score: assignment.score,
                grade: assignment.grade,
                status: assignment.status,
                pointsPossible: assignment.points_possible,
                isMissing: assignment.isMissing,
              },
            
        })
    }

    return "done";


}


export async function fetchAssignmentsAndCourses() {
    const {userId} = auth();

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
        const courses = userWithCoursesAndAssignments.enrollments.map(enrollment => ({
          ...enrollment.course,
          assignments: enrollment.course.assignments,
        }));
    
        return courses;
      } catch (error) {
        console.error("Failed to fetch user courses and assignments:", error);
        throw error; // Rethrow or handle as needed
      }

}