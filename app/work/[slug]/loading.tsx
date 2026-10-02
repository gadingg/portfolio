export default function StudyCaseLoading() {
  return (
    <main className="min-h-screen px-5 pb-20 pt-28 sm:px-8 sm:pt-36" aria-busy="true" aria-label="Loading project">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="h-3 w-32 rounded bg-white/10" />
        <div className="mt-7 h-12 max-w-3xl rounded bg-white/10 sm:h-20" />
        <div className="mt-4 h-5 max-w-xl rounded bg-white/[0.07]" />
        <div className="mt-10 aspect-[16/9] w-full rounded-[24px] bg-white/[0.06]" />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-28 rounded-[18px] bg-white/[0.05]" />
          ))}
        </div>
      </div>
    </main>
  );
}
