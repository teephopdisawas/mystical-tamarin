import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login"; // Import Login page
import Dashboard from "./pages/Dashboard"; // Import Dashboard page
import Notes from "./pages/Notes"; // Import Notes page
import Gallery from "./pages/Gallery"; // Import Gallery page
import Messaging from "./pages/Messaging"; // Import Messaging page
import Calculator from "./pages/Calculator"; // Import Calculator page
import TodoList from "./pages/TodoList"; // Import TodoList page
import { SessionContextProvider } from '@supabase/auth-helpers-react'; // Correct package for SessionContextProvider
import { supabase } from '@/integrations/supabase/client'; // Import supabase client

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SessionContextProvider supabaseClient={supabase}> {/* Wrap with SessionContextProvider */}
          <Routes>
            <Route path="/login" element={<Login />} /> {/* Add Login route */}
            <Route path="/dashboard" element={<Dashboard />} /> {/* Add Dashboard route */}
            <Route path="/notes" element={<Notes />} /> {/* Add Notes route */}
            <Route path="/gallery" element={<Gallery />} /> {/* Add Gallery route */}
            <Route path="/messaging" element={<Messaging />} /> {/* Add Messaging route */}
            <Route path="/calculator" element={<Calculator />} /> {/* Add Calculator route */}
            <Route path="/todo" element={<TodoList />} /> {/* Add TodoList route */}
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SessionContextProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;