import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { showSuccess, showError } from '@/utils/toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Trash2, CheckCircle, Circle } from 'lucide-react'; // Import icons

// Define the schema for the new todo form
const todoFormSchema = z.object({
  task: z.string().min(1, { message: "Task cannot be empty." }),
});

type TodoFormValues = z.infer<typeof todoFormSchema>;

interface Todo {
  id: string;
  user_id: string;
  task: string;
  is_completed: boolean;
  created_at: string;
}

const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoFormSchema),
    defaultValues: {
      task: '',
    },
  });

  // Fetch user and todos on component mount
  useEffect(() => {
    const fetchUserAndTodos = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data, error } = await supabase
          .from('todos')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching todos:', error);
          showError('Failed to load todos.');
        } else if (data) {
          setTodos(data);
        }
      }
      setLoading(false);
    };

    fetchUserAndTodos();

    // Optional: Listen for real-time changes if needed later
    // const subscription = supabase
    //   .channel('todos')
    //   .on('postgres_changes', { event: '*', schema: 'public', table: 'todos', filter: `user_id=eq.${user?.id}` }, payload => {
    //     console.log('Change received!', payload);
    //     // Handle real-time updates to todos list
    //   })
    //   .subscribe();

    // return () => {
    //   subscription.unsubscribe();
    // };

  }, []); // Empty dependency array means this runs once on mount

  // Handle new todo submission
  async function onSubmit(values: TodoFormValues) {
    if (!user) {
      showError('You must be logged in to create todos.');
      return;
    }

    const { data, error } = await supabase
      .from('todos')
      .insert([
        {
          user_id: user.id,
          task: values.task,
        },
      ])
      .select() // Select the inserted row to get its data
      .single(); // Expecting a single row back

    if (error) {
      console.error('Error creating todo:', error);
      showError('Failed to create todo.');
    } else if (data) {
      showSuccess('Todo created successfully!');
      setTodos([data, ...todos]); // Add the new todo to the top of the list
      form.reset(); // Clear the form
    }
  }

  // Handle todo deletion
  const handleDeleteTodo = async (todoId: string) => {
    if (!user) {
      showError('You must be logged in to delete todos.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this todo?')) { // Simple confirmation
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', todoId)
        .eq('user_id', user.id); // Ensure user can only delete their own todos

      if (error) {
        console.error('Error deleting todo:', error);
        showError('Failed to delete todo.');
      } else {
        showSuccess('Todo deleted successfully!');
        // Remove the deleted todo from the state
        setTodos(todos.filter(todo => todo.id !== todoId));
      }
    }
  };

  // Handle toggling todo completion status
  const handleToggleComplete = async (todo: Todo) => {
    if (!user) {
      showError('You must be logged in to update todos.');
      return;
    }

    const { data, error } = await supabase
      .from('todos')
      .update({ is_completed: !todo.is_completed })
      .eq('id', todo.id)
      .eq('user_id', user.id) // Ensure user can only update their own todos
      .select() // Select the updated row
      .single(); // Expecting a single row back

    if (error) {
      console.error('Error updating todo:', error);
      showError('Failed to update todo.');
    } else if (data) {
      showSuccess(`Todo marked as ${data.is_completed ? 'completed' : 'incomplete'}!`);
      // Update the todo in the state
      setTodos(todos.map(t => t.id === data.id ? data : t));
    }
  };


  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading todos...</div>;
  }

  if (!user) {
     return <div className="flex items-center justify-center min-h-screen">Please log in to view your todos.</div>;
  }


  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md p-4 flex flex-col">
        <h3 className="text-lg font-semibold mb-4">Mini Apps</h3>
        <ul className="flex-grow space-y-2">
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
           <li>
            <Link
              to="/gallery"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full justify-start"
              )}
            >
              Gallery
            </Link>
          </li>
           <li>
            <Link
              to="/messaging"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full justify-start"
              )}
            >
              Messaging
            </Link>
          </li>
           <li>
            <Link
              to="/calculator"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full justify-start"
              )}
            >
              Calculator
            </Link>
          </li>
           <li>
            <Link
              to="/todo"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full justify-start"
              )}
            >
              To-Do List
            </Link>
          </li>
          {/* Add links for future mini-apps here */}
        </ul>
        {/* Logout button can be added here or in a shared layout */}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Your To-Do List</h1>
          <p className="text-xl text-gray-600 mt-4">Manage your tasks.</p>
        </div>

        {/* New Todo Form */}
        <div className="bg-white p-6 rounded shadow-md max-w-md mx-auto mb-8">
          <h2 className="text-2xl font-bold mb-4 text-center">Add New Task</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="task"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a new task..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Add Task</Button>
            </form>
          </Form>
        </div>

        {/* Todo List */}
        <div className="max-w-md mx-auto space-y-4">
          {todos.length === 0 ? (
            <p className="text-center text-gray-600">No tasks yet. Add one above!</p>
          ) : (
            todos.map((todo) => (
              <Card key={todo.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleComplete(todo)}
                      aria-label={todo.is_completed ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      {todo.is_completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-500" />
                      )}
                    </Button>
                    <span className={cn(todo.is_completed ? 'line-through text-gray-500' : '')}>
                      {todo.task}
                    </span>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteTodo(todo.id)}
                    aria-label="Delete todo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoList;