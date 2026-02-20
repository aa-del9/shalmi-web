'use client';

import { useState, type FC, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUp } from '../react';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { cn } from '@repo/ui/lib/utils';
import type { WithClassName } from '@repo/types/common';

export const SignUpForm: FC<WithClassName> = ({ className }) => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await signUp.email({ name, email, password });

      if (result.error) {
        setError(result.error.message ?? 'Sign up failed');
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={cn('w-full max-w-md', className)}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
        <CardDescription>
          Enter your details to create a new account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/15 text-destructive rounded-md p-3 text-sm">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </Button>
          <p className="text-muted-foreground text-center text-sm">
            Already have an account?{' '}
            <Link href="/sign-in" className="text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
};
