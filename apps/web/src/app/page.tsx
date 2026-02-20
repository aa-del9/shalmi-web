export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="mb-4 text-5xl font-bold tracking-tight">Shaalmi</h1>
        <p className="text-muted-foreground mb-8 text-xl">
          B2B Ecommerce Platform
        </p>
        <p className="text-muted-foreground text-sm">
          Your monorepo is ready. Start building features in{' '}
          <code className="bg-muted rounded px-2 py-1">src/modules/</code>
        </p>
      </div>
    </main>
  );
}
