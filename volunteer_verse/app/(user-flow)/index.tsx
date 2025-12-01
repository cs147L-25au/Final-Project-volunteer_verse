import { useEffect, useState } from "react";
import { Redirect } from "expo-router";

import Login from "../../components/Login";
// import Loading from "../components/Loading";

// import { db } from "../database";

// import type { Session, AuthChangeEvent } from "../supabase/supabase-js";

export default function App() {
  //   const [session, setSession] = useState<Session | null>(null);
  //   const [isLoading, setIsLoading] = useState<boolean>(true); // Default to true for initial load

  //   useEffect(() => {
  //     // Get the auth session from the database
  //     const getSession = async () => {
  //       try {
  //         const {
  //           data: { session },
  //         } = await db.auth.getSession();
  //         setSession(session);
  //       } catch (error) {
  //         console.error("Error getting session:", error);
  //       } finally {
  //         setIsLoading(false);
  //       }
  //     };

  //     setIsLoading(true);
  //     getSession();

  //     // Listen for changes in the auth state
  //     const {
  //       data: { subscription },
  //     } = db.auth.onAuthStateChange(
  //       (_event: AuthChangeEvent, session: Session | null) => {
  //         setSession(session);
  //         setIsLoading(false);
  //       }
  //     );

  //     return () => subscription.unsubscribe();
  //   }, []);

  //   if (session) {
  //     return <Redirect href="/tabs" />;
  //   } else if (isLoading) {
  //     return <Loading />;
  //   } else {
  return <Login />;
  //}
}
