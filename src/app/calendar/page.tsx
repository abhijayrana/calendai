"use client";
import React from "react";
import Canvas from "../../ui/calendar/Canvas";
import ToDo from "../../ui/calendar/todo/ToDo";
import Calendar from "../../ui/calendar/Calendar";
import SetupLMS from "@/ui/lms-gms/SetUpLMS";
import { trpc } from "@/app/_trpc/client";
import { useUser } from "@clerk/nextjs"; // Assuming 'currentUser' was not used
import { useRouter } from "next/navigation";
import { useEffect } from "react";
const Page: React.FC = () => {
  const { isLoaded, user } = useUser();

  const router = useRouter();

    // Conditional query execution based on `isLoaded` and if `user` exists
    const {isLoading, isError, data} = trpc.user.isUserSetupWithLMSandGMS.useQuery(
      { emailAddress: user?.primaryEmailAddress?.toString()! },
      { enabled: !!user && isLoaded } // The query runs only if user is defined and isLoaded is true
    );


  
    useEffect(() => {
      if (!isLoaded) return; // Exit early if the user state isn't loaded yet
      if (!user) {
        router.push("/login");
      }
    }, [isLoaded, user, router]); // Depend on isLoaded and user state


    if (!isLoaded) {
      return <p>Loading...</p>;
    }
    


  if(isLoading) {
    return <p>Loading IsUserSetup with LMS GMS...</p>;
  }

  // Checking if the LMS setup query was successful or exists
  // Assuming the query returns a boolean or something that evaluates to true/false
  const isLmsSetup = !!data?.lms; 


  return (
    <div className="flex h-full">
        {isLmsSetup ? (
          <>
            <div className="flex-1 p-4 border-r overflow-auto" style={{ flex: 4 }}>
          <Canvas />
            </div>
            <div className="flex-1 p-4 overflow-auto" style={{ flex: 6 }}>
          <Calendar />
            </div>
          {/* <div className="flex-1 p-4 overflow-auto">
            <ToDo />
          </div> */}
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
