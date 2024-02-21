"use client";

import React, { useEffect } from "react";
import { trpc } from "@/app/_trpc/client";

function List() {
  // const { data, isLoading, error } = trpc.powerschool.getStudentInfo.useQuery();

  // if(isLoading) {
  //   return <div>Loading...</div>;
  // }
  
  // console.log(data);

  return (
    <div>
      {/* <h1>{data}</h1> */}
      <h1>Calendar</h1>
    </div>
  );
}

export default List;
