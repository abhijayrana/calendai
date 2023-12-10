import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="my-8"> 
        <h1 className="text-6xl font-bold text-center pb-6">
          Welcome to <span className="text-blue-600">Calendai</span>
        </h1>
        <p className="text-xl text-center">
          <span className="text-blue-600">Calendai:</span> Revolutionizing student calendars.
        </p>
      </div>
    </main>
  );
} 
