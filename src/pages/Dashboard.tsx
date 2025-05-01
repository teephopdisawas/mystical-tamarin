import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { showSuccess, showError } from '@/utils/toast';

// Define the schema for the profile update form
const profileFormSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<{ first_name: string | null; last_name: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch user profile
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      showError('Failed to load profile data.');
      setProfile(null); // Ensure profile is null on error
    } else if (data) {
      setProfile(data);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        await fetchProfile(user.id); // Fetch profile when user is set
      } else {
        // If no user, redirect to login
        navigate('/login');
      }
      setLoading(false);
    };

    fetchUserData();

    // Listen for auth state changes (e.g., logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        // User logged out, redirect to login
        navigate('/login');
      } else {
        setUser(session.user);
        fetchProfile(session.user.id); // Re-fetch profile on user change/login
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Initialize form with profile data once loaded
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
    },
    values: { // Keep form values synced with profile state
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
    },
  });

  // Handle profile update form submission
  async function onSubmit(values: ProfileFormValues) {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: values.first_name,
        last_name: values.last_name,
      })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
      showError('Failed to update profile.');
    } else {
      showSuccess('Profile updated successfully!');
      // Re-fetch profile to update state and form values
      fetchProfile(user.id);
    }
  }

  // Handle user logout
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      showError('Failed to log out.');
    }
    // Redirect is handled by the onAuthStateChange listener
  };

  if (loading || !user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar Placeholder */}
      <div className="w-64 bg-white shadow-md p-4 flex flex-col">
        <h3 className="text-lg font-semibold mb-4">Mini Apps</h3>
        <ul className="flex-grow">
          <li className="mb-2"><a href="/dashboard" className="text-blue-600 hover:underline">Dashboard</a></li>
          {/* Add links for future mini-apps here */}
          {/* <li className="mb-2"><a href="/mini-app-1" className="text-blue-600 hover:underline">Mini App 1</a></li> */}
          {/* <li className="mb-2"><a href="/mini-app-2" className="text-blue-600 hover:underline">Mini App 2</a></li> */}
        </ul>
        <div className="mt-auto">
           <Button onClick={handleLogout} className="w-full">Logout</Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome to Your Portal, {profile?.first_name || user.email}!
          </h1>
          {profile && profile.first_name && profile.last_name && (
             <p className="text-lg text-gray-700">({user.email})</p>
          )}
           {!profile?.first_name && !profile?.last_name && (
             <p className="text-lg text-gray-700">({user.email})</p>
          )}
          <p className="text-xl text-gray-600 mt-4">This is your central dashboard.</p>
        </div>

        {/* Profile Update Form */}
        <div className="bg-white p-6 rounded shadow-md max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-center">Update Profile</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="First Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Last Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Update Profile</Button>
            </form>
          </Form>
        </div>

        {/* Placeholder for other dashboard content or mini-apps */}
        <div className="mt-8 bg-white p-6 rounded shadow-md max-w-md mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Mini App Content Area</h2>
            <p className="text-gray-600">This is where content for your mini-apps will appear.</p>
            {/* Add components for mini-apps here */}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;