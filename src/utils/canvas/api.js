// This file contains functions to fetch data from the Canvas API

// Fetch courses with assignments + grades from the Canvas API
export async function fetchCoursesAssignmentsWithGrades(token) {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    // console.log("Fetching initial courses...");

    const initialCoursesResponse = await fetch(`${process.env.URL}/api/v1/courses?enrollment_state=active&per_page=10&page=1`, { headers });
    if (!initialCoursesResponse.ok) {
      throw new Error(`init HTTP error! status: ${initialCoursesResponse.status}`);
    }
    const linkHeader = initialCoursesResponse.headers.get('link');
    const courses = await initialCoursesResponse.json();

    // console.log("Initial courses fetched:", courses.length);

    const totalPages = extractTotalPages(linkHeader);

    // console.log("Total pages of courses:", totalPages);

    for (let page = 2; page <= totalPages; page++) {
      console.log(`Fetching courses page: ${page}`);
      const coursesResponse = await fetch(`${process.env.URL}/api/v1/courses?enrollment_state=active&per_page=10&page=${page}`, { headers });
      if (!coursesResponse.ok) {
        console.error(`course searching HTTP error! status: ${coursesResponse.status}`);
        throw new Error(`course searching HTTP error! status: ${coursesResponse.status}`);
      }
      const additionalCourses = await coursesResponse.json();
      courses.push(...additionalCourses);
    }

    // console.log("All courses fetched. Total courses:", courses.length);

    const currentDate = new Date();
    const currentCourses = courses.filter(course => new Date(course.start_at) <= currentDate);



    const coursesWithAssignmentsAndGrades = await Promise.all(currentCourses.map(async (course) => {
      // console.log(`Processing course: ${course.name}`);

      let assignments = [];
      let page = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        // console.log(`Fetching assignments for course ${course.name}, page:`, page);
        const assignmentsResponse = await fetch(`${process.env.URL}/api/v1/courses/${course.id}/assignments?per_page=10&page=${page}`, { headers });
        if (!assignmentsResponse.ok) {
          console.error(`assignment search HTTP error! status: ${assignmentsResponse.status}, course ID: ${course.id}`);
          throw new Error(`assignment search HTTP error! status: ${assignmentsResponse.status}`);
        }

        const linkHeader = assignmentsResponse.headers.get('link');
        const newAssignments = await assignmentsResponse.json();
        // console.log(`Assignments fetched for course ${course.name}, page: ${page}:`, newAssignments.length);
        assignments.push(...newAssignments);

        const parsedLink = parseLinkHeader(linkHeader);
        hasMorePages = !!parsedLink.next;
        // console.log(course.name, "pages so far", page);

        page++;
      }

      // console.log(`Total assignments fetched for course ${course.name}:`, assignments.length);

      const assignmentsWithGrades = await Promise.all(assignments.map(async (assignment) => {
        // console.log(`Fetching grade for ${assignment.name} ${assignment.id}`);
        const submissionResponse = await fetch(`${process.env.URL}/api/v1/courses/${course.id}/assignments/${assignment.id}/submissions/${process.env.CANVAS_ID}`, { headers });
        if (!submissionResponse.ok) {
          console.error(`Course: ${course.id} HTTP error fetching grade for ${assignment.name} ${assignment.id}: status: ${submissionResponse.status}`);
          // throw new Error(`HTTP error! status: ${submissionResponse.status}`);
          return { ...assignment, missing: true, grade: null, score: null };
        }
        const submission = await submissionResponse.json();
        return { ...assignment, missing: submission.missing, grade: submission.grade, score: submission.score };
      }));


    // const assignmentsWithGrades = assignments
      // console.log(`Assignments with grades processed for course ${course.name}`);

      return {
        course_code: course.course_code,
        created_at: course.created_at,
        enrollments: course.enrollments,
        grade_passback_setting: course.grade_passback_setting,
        id: course.id,
        name: course.name, // Uncommented name for logging
        uuid: course.uuid,
        time_zone: course.time_zone,
        enrollment_term_id: course.enrollment_term_id,
        assignments: assignmentsWithGrades
      };
    }));

    // console.log("Completed processing all courses.");

    return coursesWithAssignmentsAndGrades;
  } catch (error) {
    console.error("Error fetching courses, assignments, or grades:", error);
    throw error;
  }
}

// Ensure you have a function `parseLinkHeader(linkHeader)` defined to parse the Link header

// function `parseLinkHeader(linkHeader)` defined to parse the Link header
function extractTotalPages(linkHeader) {
  // Splitting the Link header into its constituent parts
  const links = linkHeader.split(',');
  let lastPageNumber = 1; // Default to 1 in case the 'last' rel type is not found

  // Iterate through each link segment to find the 'last' page link
  links.forEach(link => {
    if (link.includes('rel="last"')) {
      // Extract the page number from the 'last' segment
      const match = link.match(/page=(\d+)/);
      if (match && match[1]) {
        lastPageNumber = parseInt(match[1], 10);
      }
    }
  });

  return lastPageNumber;
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

    // console.log(parsedLink);
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

