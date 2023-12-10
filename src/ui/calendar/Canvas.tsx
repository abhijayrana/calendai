"use client";
import { useState, useEffect, } from "react";
import { trpc } from "@/app/_trpc/client";
import fetchCurrentCoursesAndAssignments from "@/utils/canvas/api"

export default function TodoList() {

    const {data, isLoading, isError, error} = trpc.powerschool.assignments.useQuery({url: 'https://bcp.instructure.com:443'})


    if (isLoading) {
        return <div>Loading...</div>;
    }
    
    if (isError) {
        return <div>Error: {error.message}</div>;
    }
    
    // Now you can safely use 'data'
    console.log("assignments", data);


  return (
    <div>
      <h1>hi</h1>
    </div>
  );
}
