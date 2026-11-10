// One panel split by thin dividers instead of a row of separate cards.
export default function StatStrip({ items }) {
  return (
    <dl className="panel grid grid-cols-2 divide-line sm:flex sm:divide-x">
      {items.map((item, i) => (
        <div
          key={item.label}
          className={`flex-1 px-5 py-4 ${i % 2 === 1 ? 'border-l border-line sm:border-l-0' : ''} ${
            i >= 2 ? 'border-t border-line sm:border-t-0' : ''
          }`}
        >
          <dt className="text-sm text-muted">{item.label}</dt>
          <dd className={`mt-1 font-display text-[32px] font-bold leading-none ${item.tone || ''}`}>{item.value}</dd>
          {item.note && <p className="mt-1.5 text-xs text-muted">{item.note}</p>}
        </div>
      ))}
    </dl>
  );
}
