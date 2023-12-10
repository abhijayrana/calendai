async function fetchCurrentCoursesAndAssignments(baseUrl, token) {
    try {
        // Define the headers with the Bearer token
        const headers = {
            'Authorization': `Bearer ${token}`
        };

        // Fetch courses with the token in the headers
        const coursesResponse = await fetch(`${baseUrl}/api/v1/courses?enrollment_state=active`, { headers });
        const courses = await coursesResponse.json();
       // Filter courses based on the start date
       const currentDate = new Date();
       const currentCourses = courses.filter(course => new Date(course.start_at) <= currentDate);

        // Fetch assignments for each current course with the token in the headers
        const assignmentsPromises = currentCourses.map(course =>
            fetch(`${baseUrl}/api/v1/courses/${course.id}/assignments`, { headers }).then(res => res.json())
        );

        const assignments = await Promise.all(assignmentsPromises);
        console.log("assignments", typeof assignments, "assignments");
        return assignments;
    } catch (error) {
        console.error('Error fetching courses or assignments:', error);
        throw error;
    }
}


// Usage


export default fetchCurrentCoursesAndAssignments;
