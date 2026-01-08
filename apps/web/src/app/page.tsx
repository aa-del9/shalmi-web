export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-4">Shaalmi</h1>
        <p className="text-xl text-muted-foreground mb-8">
          B2B Ecommerce Platform
        </p>
        <p className="text-sm text-muted-foreground">
          Your monorepo is ready. Start building features in{" "}
          <code className="bg-muted px-2 py-1 rounded">src/modules/</code>
        </p>
      </div>
    </main>
  );
}
