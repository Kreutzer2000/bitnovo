// src/components/TimerDisplay.tsx
interface TimerDisplayProps {
    timer: number;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ timer }) => (
    <span className="timer">{new Date(timer * 1000).toISOString().substr(14, 5)}</span> // Formato mm:ss
);

export default TimerDisplay;