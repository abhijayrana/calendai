
import React from "react";
import Canvas from "../../ui/calendar/Canvas";
import ToDo from "../../ui/calendar/todo/ToDo";
import Calendar from "../../ui/calendar/Calendar";
import { trpc } from "../_trpc/client";
import { currentUser } from "@clerk/nextjs";

const Page: React.FC = async () => {
  const user =  await currentUser();
  console.log(user);
  // const LMSboolean = trpc.user.isUserSetupWithLMS.useQuery({emailAddress: user?.primaryEmailAddressId!})
  const LMSboolean = true
  return (
    <div className="flex h-full">
      {LMSboolean ? (
        <>
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
      ): (
        <div>
          <p>Looks like you haven't set up your LMS yet. Please do so in the settings tab.</p>
        </div>
      )}

    </div>
  );
};

export default Page;
