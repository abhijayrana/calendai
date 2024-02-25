"use client";
import React from "react";
import Canvas from "../../ui/calendar/Canvas";
import ToDo from "../../ui/calendar/todo/ToDo";
import Calendar from "../../ui/calendar/Calendar";
import SetupLMS from "@/ui/lms-gms/SetUpLMS";
import { trpc } from "@/app/_trpc/client";
import { useUser } from "@clerk/nextjs"; // Assuming 'currentUser' was not used
import { useRouter } from "next/navigation";

const Page: React.FC = () => {
  const { isLoaded, user } = useUser();

  const router = useRouter();

    // Conditional query execution based on `isLoaded` and if `user` exists
    const {isLoading, isError, data} = trpc.user.isUserSetupWithLMSandGMS.useQuery(
      { emailAddress: user?.primaryEmailAddress?.toString()! },
      { enabled: !!user && isLoaded } // The query runs only if user is defined and isLoaded is true
    );

    if (!isLoaded) {
      return <p>Loading...</p>;
    }
  

  if (!user) {
    router.push("/login");
  }





  if(isLoading) {
    return <p>Loading IsUserSetup...</p>;
  }

  // Checking if the LMS setup query was successful or exists
  // Assuming the query returns a boolean or something that evaluates to true/false
  const isLmsSetup = !!data?.lms; 


  return (
    <div className="flex h-full">
      {/* {user?.username && <div>{user.username}</div>} */}
      {isLmsSetup ? (
        <>
        <p>{data?.lms}</p>
          <div className="flex-1 p-4 border-r overflow-auto">
            <Canvas />
          </div>
          <div className="flex-1 p-4 border-r overflow-auto">
            <Calendar />
          </div>
          <div className="flex-1 p-4 overflow-auto">
            <ToDo />
          </div>
        </>
      ) : (
        <div>
          <SetupLMS />
        </div>
      )}
    </div>
  );
};

export default Page;
