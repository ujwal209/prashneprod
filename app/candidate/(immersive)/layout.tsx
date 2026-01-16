export default function ImmersiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-full bg-zinc-900 text-foreground overflow-hidden">
      {children}
    </div>
  );
}