// This file contains functions to fetch data from the Canvas API

// Fetch courses with assignments + grades from the Canvas API
export async function fetchCoursesAssignmentsWithGrades(token) {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    // Fetch courses with the token in the headers
    const coursesResponse = await fetch(`${process.env.URL}/api/v1/courses?enrollment_state=active`, { headers });
    if (!coursesResponse.ok) {
      throw new Error(`HTTP error! status: ${coursesResponse.status}`);
    }
    const courses = await coursesResponse.json();

    // Filter courses based on the start date
    const currentDate = new Date();
    const currentCourses = courses.filter(course => new Date(course.start_at) <= currentDate);

    // Iterate through current courses to fetch all assignments and their submissions
    const coursesWithAssignmentsAndGrades = await Promise.all(currentCourses.map(async (course) => {
      let assignments = [];
      let page = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        const assignmentsResponse = await fetch(`${process.env.URL}/api/v1/courses/${course.id}/assignments?per_page=10&page=${page}`, { headers });
        if (!assignmentsResponse.ok) {
          throw new Error(`HTTP error! status: ${assignmentsResponse.status}`);
        }
        
        const linkHeader = assignmentsResponse.headers.get('link');
        const newAssignments = await assignmentsResponse.json();
        assignments.push(...newAssignments);

        const parsedLink = parseLinkHeader(linkHeader);
        hasMorePages = !!parsedLink.next;
        page++;
      }

      // Fetch submission (grade) info for each assignment
      const assignmentsWithGrades = await Promise.all(assignments.map(async (assignment) => {
        const submissionResponse = await fetch(`${process.env.URL}/api/v1/courses/${course.id}/assignments/${assignment.id}/submissions/${process.env.CANVAS_ID}`, { headers });
        if (!submissionResponse.ok) {
          throw new Error(`HTTP error! status: ${submissionResponse.status}`);
        }
        const submission = await submissionResponse.json();
        return { ...assignment, grade: submission.grade, score: submission.score };
      }));

      return { ...course, assignments: assignmentsWithGrades };
    }));

    return coursesWithAssignmentsAndGrades;
  } catch (error) {
    console.error("Error fetching courses, assignments, or grades:", error);
    throw error;
  }
}

function parseLinkHeader(header) {
  if (!header || header.length === 0) {
    return {};
  }
  const parts = header.split(',');
  const links = {};
  parts.forEach(p => {
    const section = p.split(';');
    const url = section[0].replace(/<(.*)>/, '$1').trim();
    const name = section[1].replace(/rel="(.*)"/, '$1').trim();
    links[name] = url;
  });
  return links;
}

export async function fetchAssignmentsFromCourse( token) {
  try {
    // Define the headers with the Bearer token
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(
      `${process.env.URL}/api/v1/users/${process.env.CANVAS_ID}/courses/${process.env.ZAB_BC}/assignments?page=1&per_page=10`,
      { headers }
    );

    const res = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const headersObject = {};
    response.headers.forEach((value, key) => {
      headersObject[key] = value;
    });

    const link = headersObject.link;
    const parsedLink = link.split(",").reduce((acc, link) => {
      const parts = link.split(";");
      const url = parts[0].trim().slice(1, -1);
      const rel = parts[1].trim().split("=")[1].slice(1, -1);
      acc[rel] = url;
      return acc;
    }, {});

    console.log(parsedLink);
    if (!parsedLink.last) {
      const assignments = {
        assignments: res,
        headers: headersObject,
      };
      return assignments;
    }

    const lim = parsedLink.last.split("page=")[1][0];

    for (let i = 2; i <= lim; i++) {
      const response = await fetch(
        `${process.env.URL}/api/v1/users/${process.env.CANVAS_ID}/courses/${process.env.ZAB_BC}/assignments?per_page=10&page=${i}`,
        { headers }
      );
      const res2 = await response.json();
      res.push(...res2);
    }

    const assignments = res;
    return assignments;
  } catch (error) {
    console.error("Error fetching courses or assignments:", error);
    throw error;
  }
}



export async function fetchSubmissionInfo(assignmentId) {
    try{
        const headers = {
            Authorization: `Bearer ${process.env.CANVAS_TOKEN}`,
        };

        const response = await fetch(
            `${process.env.URL}/api/v1/courses/${process.env.ZAB_BC}/assignments/${assignmentId}/submissions/${process.env.CANVAS_ID}`,
            { headers }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const submission = await response.json();
        return submission;

    }
    catch (error) {
        console.error("Error fetching submission:", error);
        throw error;
    }

}

