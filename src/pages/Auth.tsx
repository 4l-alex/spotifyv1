import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';

const authSchema = z.object({
  email: z.string().email('Email non valida'),
  password: z.string().min(6, 'La password deve avere almeno 6 caratteri'),
});

type AuthFormValues = z.infer<typeof authSchema>;

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: AuthFormValues) => {
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(values.email, values.password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Email o password non corretti');
          } else if (error.message.includes('Email not confirmed')) {
            toast.error('Conferma la tua email prima di accedere');
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success('Accesso effettuato!');
        navigate('/');
      } else {
        const { error } = await signUp(values.email, values.password);
        if (error) {
          if (error.message.includes('User already registered')) {
            toast.error('Questa email è già registrata');
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success('Registrazione completata! Controlla la tua email per confermare.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
      {/* Background stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/50 rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-primary mb-4">
            <span className="text-4xl">🎵</span>
          </div>
          <h1 className="text-2xl font-bold text-glow">MusicApp</h1>
          <p className="text-muted-foreground mt-2">
            {isLogin ? 'Accedi al tuo account' : 'Crea un nuovo account'}
          </p>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="esempio@email.com"
                      className="bg-muted/50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="bg-muted/50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full glow-primary"
              disabled={isLoading}
            >
              {isLoading
                ? 'Caricamento...'
                : isLogin
                ? 'Accedi'
                : 'Registrati'}
            </Button>
          </form>
        </Form>

        {/* Toggle */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {isLogin
              ? 'Non hai un account? Registrati'
              : 'Hai già un account? Accedi'}
          </button>
        </div>
      </div>
    </div>
  );
}
