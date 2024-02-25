"use client";
import { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { trpc } from "@/app/_trpc/client";

export default function SignUpForm({ redirectTo = "/calendar" }) {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const router = useRouter();
  //   const dbResponse = trpc.addUserToDatabase.useMutation()

  const addToDb = trpc.user.signup.useMutation();

  // start the sign up process.
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!isLoaded) {
      return;
    }

    try {
      await signUp
        .create({
          emailAddress,
          username: username,
          password,
        })
        .then((result) => {
          if (result.status === "complete") {
            console.log(result);
            setActive({ session: result.createdSessionId });
            addToDb.mutate({
              emailAddress: result.emailAddress!,
              username: result.username!,
              clerkID: result.createdUserId!,
            });

            // dbResponse.mutate({uid: result.createdUserId!.toString()})
          } else {
            console.log(emailAddress, username, password);
            console.log(result);
          }
        })
        .catch((err) => {
          console.error("error", err.errors[0].longMessage);
        });

      router.push(redirectTo);
      
      // send the email.
      //   await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      //   // change the UI to our pending section.
      //   console.log(pendingVerification)
      //   setPendingVerification(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  //   // This verifies the user using email code that is delivered.
  //   const onPressVerify = async (e: any) => {
  //     e.preventDefault();
  //     if (!isLoaded) {
  //       return;
  //     }

  //     try {
  //       const completeSignUp = await signUp.attemptEmailAddressVerification({
  //         code,
  //       });
  //       if (completeSignUp.status !== "complete") {
  //         /*  investigate the response, to see if there was an error
  //          or if the user needs to complete more steps.*/
  //         console.log(JSON.stringify(completeSignUp, null, 2));
  //       }
  //       if (completeSignUp.status === "complete") {
  //         await setActive({ session: completeSignUp.createdSessionId })
  //         // dbResponse.mutate({uid: "12"})
  //         router.push("/");
  //       }
  //     } catch (err: any) {
  //       console.error(JSON.stringify(err, null, 2));
  //     }
  //   };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-3 rounded-xl bg-white shadow-lg">
        {!pendingVerification && (
          <form className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                onChange={(e) => setEmailAddress(e.target.value)}
                id="email"
                name="email"
                type="email"
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                onChange={(e) => setUsername(e.target.value)}
                id="username"
                name="username"
                type="text"
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                onChange={(e) => setPassword(e.target.value)}
                id="password"
                name="password"
                type="password"
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSubmit}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign up
            </button>
          </form>
        )}

        {/* {pendingVerification && (
        <div>
          <form>
            <input
              value={code}
              placeholder="Code..."
              onChange={(e) => setCode(e.target.value)}
            />
            <button onClick={onPressVerify}>
              Verify Email
            </button>
          </form>
        </div>
      )} */}
      </div>
    </main>
  );
}
