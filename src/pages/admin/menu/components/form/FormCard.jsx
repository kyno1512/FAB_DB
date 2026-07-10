export default function FormCard({ icon, title, children, className = '' }) {
  return (
    <section className={`rounded-[14px] bg-white p-6 shadow-sm ${className}`}>
      <div className="mb-5 flex items-center gap-2.5">
        <span className="text-primary">{icon}</span>
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>
      {children}
    </section>
  )
}
