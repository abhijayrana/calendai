import React from "react";
import Canvas from "../../ui/calendar/Canvas";
import ToDo from "../../ui/calendar/todo/ToDo";
import Calendar from "../../ui/calendar/Calendar";

const Page: React.FC = () => {
  return (
    <div className="flex h-full">
      <div className="flex-1 p-4 overflow-auto">
        <Canvas />
      </div>
      <div className="flex-1 p-4 border-r overflow-auto">
        <Calendar />
      </div>
      <div className="flex-1 p-4 overflow-auto">
        <ToDo />
      </div>
    </div>
  );
};

export default Page;
