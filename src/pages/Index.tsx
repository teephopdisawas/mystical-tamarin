import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react"; // Import useSession

const Index = () => {
  const navigate = useNavigate();
  const session = useSession(); // Get the user session

  useEffect(() => {
    // Check if session is defined (meaning the auth state has been loaded)
    if (session !== undefined) {
      if (session) {
        // User is logged in, redirect to dashboard
        console.log("User is logged in, redirecting to dashboard.");
        navigate("/dashboard");
      } else {
        // User is not logged in, redirect to login
        console.log("User is not logged in, redirecting to login.");
        navigate("/login");
      }
    }
  }, [session, navigate]); // Depend on session and navigate

  // You can return a loading indicator or null while the check happens
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Loading Portal...</h1>
        <p className="text-xl text-gray-600">Checking authentication status.</p>
      </div>
    </div>
  );
};

export default Index;