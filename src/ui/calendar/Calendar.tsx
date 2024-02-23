"use client";

import React, { useEffect } from "react";
import { trpc } from "@/app/_trpc/client";


const List: any = () => {



  return (
    <div>
      <p
        style={{
          fontSize: "1.5rem",
          marginBottom: "20px",
          margin: "10px",
          position: "sticky",
          top: "0",
        }}
      >
        Calendar for Today

      </p>
    </div>
  );
};

export default List;
