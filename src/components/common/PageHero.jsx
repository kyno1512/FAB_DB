export default function PageHero({ eyebrow, title, description, children }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-[#2a8585] text-white">
      <div
        className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-white/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-12 -left-8 size-32 rounded-full bg-black/10 blur-2xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-[1180px] px-4 py-5 sm:px-6 sm:py-6 lg:py-7">
        {eyebrow && (
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white/75 sm:text-xs">{eyebrow}</p>
        )}
        <h1 className="mt-1 font-display text-2xl font-bold leading-tight sm:text-[1.75rem] lg:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-white/90 sm:text-sm">{description}</p>
        )}
        {children}
      </div>
    </section>
  )
}
