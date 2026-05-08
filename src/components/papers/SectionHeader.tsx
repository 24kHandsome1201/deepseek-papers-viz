interface Props {
  eyebrow: string;
  title: string;
  desc?: string;
}

export default function SectionHeader({ eyebrow, title, desc }: Props) {
  return (
    <div className="mb-8">
      <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)] mb-2">
        {eyebrow}
      </div>
      <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
      {desc && (
        <p className="mt-2 text-[var(--muted)] max-w-2xl text-sm leading-relaxed">
          {desc}
        </p>
      )}
    </div>
  );
}
