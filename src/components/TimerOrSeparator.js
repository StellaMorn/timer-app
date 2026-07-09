import Timer from "./Timer";

const TimerOrSeparator = ({
  isSeparator = false,
  duration,
  title,
  index,
  colorChangeThreshold,
  reminderSpeech,
  setTimerInstances,
  soundEnabled,
}) => {
  if (isSeparator) {
    return <div className="w-full h-px bg-gray-400 col-span-full"></div>;
  }

  return (
    <Timer
      duration={duration}
      title={title}
      index={index}
      colorChangeThreshold={colorChangeThreshold}
      reminderSpeech={reminderSpeech}
      setTimerInstances={setTimerInstances}
      soundEnabled={soundEnabled}
    />
  );
};

export default TimerOrSeparator;
