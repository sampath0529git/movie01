export default function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
    </div>
  );
}
