import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { showSuccess, showError } from '@/utils/toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react'; // Import Trash2 icon

// Define the schema for the new note form
const noteFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  content: z.string().optional(),
});

type NoteFormValues = z.infer<typeof noteFormSchema>;

interface Note {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
}

const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  // Fetch user and notes on component mount
  useEffect(() => {
    const fetchUserAndNotes = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching notes:', error);
          showError('Failed to load notes.');
        } else if (data) {
          setNotes(data);
        }
      }
      setLoading(false);
    };

    fetchUserAndNotes();

    // Optional: Listen for real-time changes if needed later
    // const subscription = supabase
    //   .channel('notes')
    //   .on('postgres_changes', { event: '*', schema: 'public', table: 'notes', filter: `user_id=eq.${user?.id}` }, payload => {
    //     console.log('Change received!', payload);
    //     // Handle real-time updates to notes list
    //   })
    //   .subscribe();

    // return () => {
    //   subscription.unsubscribe();
    // };

  }, []); // Empty dependency array means this runs once on mount

  // Handle new note submission
  async function onSubmit(values: NoteFormValues) {
    if (!user) {
      showError('You must be logged in to create notes.');
      return;
    }

    const { data, error } = await supabase
      .from('notes')
      .insert([
        {
          user_id: user.id,
          title: values.title,
          content: values.content,
        },
      ])
      .select() // Select the inserted row to get its data
      .single(); // Expecting a single row back

    if (error) {
      console.error('Error creating note:', error);
      showError('Failed to create note.');
    } else if (data) {
      showSuccess('Note created successfully!');
      setNotes([data, ...notes]); // Add the new note to the top of the list
      form.reset(); // Clear the form
    }
  }

  // Handle note deletion
  const handleDeleteNote = async (noteId: string) => {
    if (!user) {
      showError('You must be logged in to delete notes.');
      return;
    }

    // Optional: Add a confirmation dialog here before deleting

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId)
      .eq('user_id', user.id); // Ensure user can only delete their own notes

    if (error) {
      console.error('Error deleting note:', error);
      showError('Failed to delete note.');
    } else {
      showSuccess('Note deleted successfully!');
      // Remove the deleted note from the state
      setNotes(notes.filter(note => note.id !== noteId));
    }
  };


  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading notes...</div>;
  }

  if (!user) {
     return <div className="flex items-center justify-center min-h-screen">Please log in to view notes.</div>;
  }


  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md p-4 flex flex-col">
        <h3 className="text-lg font-semibold mb-4">Mini Apps</h3>
        <ul className="flex-grow space-y-2"> {/* Added space-y for spacing between buttons */}
          <li>
            <Link
              to="/dashboard"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full justify-start"
              )}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/notes"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full justify-start"
              )}
            >
              Notes
            </Link>
          </li>
          {/* Add links for future mini-apps here */}
        </ul>
        {/* Logout button can be added here or in a shared layout */}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Your Notes</h1>
          <p className="text-xl text-gray-600 mt-4">Create and manage your personal notes.</p>
        </div>

        {/* New Note Form */}
        <div className="bg-white p-6 rounded shadow-md max-w-md mx-auto mb-8">
          <h2 className="text-2xl font-bold mb-4 text-center">Create New Note</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Note Title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Note content..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Save Note</Button>
            </form>
          </Form>
        </div>

        {/* Notes List */}
        <div className="max-w-md mx-auto space-y-4">
          {notes.length === 0 ? (
            <p className="text-center text-gray-600">No notes yet. Create one above!</p>
          ) : (
            notes.map((note) => (
              <Card key={note.id}>
                <CardHeader className="flex flex-row items-center justify-between"> {/* Added flex for title and button */}
                  <CardTitle>{note.title}</CardTitle>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteNote(note.id)}
                    aria-label="Delete note"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <p>{note.content}</p>
                  <p className="text-sm text-gray-500 mt-2">Created: {new Date(note.created_at).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notes;