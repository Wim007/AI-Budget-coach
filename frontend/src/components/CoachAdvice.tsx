import { CoachAdvice as CoachAdviceType } from '@/types';

interface Props {
  advice: CoachAdviceType;
}

const ALERT_STYLES = {
  green: {
    border: 'border-green-200',
    header: 'bg-green-50',
    icon: '✓',
    iconBg: 'bg-green-100 text-green-700',
    title: 'text-green-800',
  },
  orange: {
    border: 'border-orange-200',
    header: 'bg-orange-50',
    icon: '!',
    iconBg: 'bg-orange-100 text-orange-700',
    title: 'text-orange-800',
  },
  red: {
    border: 'border-red-200',
    header: 'bg-red-50',
    icon: '!!',
    iconBg: 'bg-red-100 text-red-700',
    title: 'text-red-800',
  },
};

export default function CoachAdvice({ advice }: Props) {
  const style = ALERT_STYLES[advice.alert_level];

  return (
    <div className={`bg-white rounded-2xl shadow-sm border ${style.border} overflow-hidden`}>
      <div className={`${style.header} px-6 py-4 flex items-start gap-3`}>
        <span
          className={`${style.iconBg} text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5`}
        >
          {style.icon}
        </span>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Coach advies
          </p>
          <p className={`text-sm font-semibold ${style.title}`}>{advice.summary}</p>
        </div>
      </div>

      {advice.tips.length > 0 && (
        <ul className="px-6 py-4 space-y-2">
          {advice.tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="text-green-500 mt-0.5 shrink-0">→</span>
              {tip}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
