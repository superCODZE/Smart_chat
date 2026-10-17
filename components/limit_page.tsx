type LimitPageProps = {
  onClose: () => void;
};

export default function LimitPage({ onClose }: LimitPageProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="limit-title"
        className="w-full max-w-sm rounded-2xl border border-violet-200/15 bg-[#100b17] p-6 text-center shadow-2xl shadow-black/70"
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-violet-300/20 bg-violet-950/40 text-xl text-violet-200">
          !
        </div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/70">
          Limit reached
        </p>
        <h1 id="limit-title" className="text-xl font-semibold tracking-tight">
          You have used all your available tokens
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          You will be able to use the chat again in 2 hours.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-violet-100"
        >
          Got it
        </button>
      </section>
    </div>
  );
}