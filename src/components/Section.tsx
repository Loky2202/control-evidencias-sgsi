interface SectionProps {
  id: string;
  number: string;
  title: string;
  children: React.ReactNode;
}

export default function Section({ id, number, title, children }: SectionProps) {
  return (
    <section
      id={id}
      data-section={id}
      className="scroll-mt-20 pt-12 pb-8 border-t border-slate-100"
    >
      <div className="flex items-center gap-3 mb-6">
        <span className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md shadow-emerald-100">
          {number}
        </span>
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}
