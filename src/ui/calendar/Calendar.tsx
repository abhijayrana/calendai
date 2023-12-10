"use client";

import React, { useEffect } from "react";
import { trpc } from "@/app/_trpc/client";

function List() {
  // const { data, isLoading, error } = trpc.powerschool.getStudentInfo.useQuery({
  //   email: email
  //   password: password
  // });

  return (
    <div>
      {/* <h1>{data}</h1> */}
    </div>
  );
}

export default List;
