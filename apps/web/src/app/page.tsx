'use client';
import { SignInButton } from '@/modules/auth/components/sign-in-button';
import { ImageUpload } from '@/modules/common/components/image-upload';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="mb-4 text-5xl font-bold tracking-tight">Shaalmi</h1>
        <p className="text-muted-foreground mb-8 text-xl">
          B2B Ecommerce Platform
        </p>
        <p className="text-muted-foreground mb-6 text-sm">
          Your monorepo is ready. Start building features in{' '}
          <code className="bg-muted rounded px-2 py-1">src/modules/</code>
        </p>
        <SignInButton />
        <ImageUpload
          onUploaded={(result) => {
            console.log(result);
          }}
        />
      </div>
    </main>
  );
}
