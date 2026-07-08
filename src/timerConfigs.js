const timerConfigs = [
  {
    id: 1,
    label: "Von Leon",
    description: `Teleport Timers First Teleport 10-18 seconds then every 1min

Jail Timers First Jail is 3mins when it spawns then its every 4mins

Dispel Timers every 1 min

Gargoyles Timers First spawn 1 min 30 secs then every 2 mins 30 secs after that

Golems Timers spawn at 50% then every 2 mins
      `,
    timers: [
      {
        duration: 60,
        title: "Teleport",
        colorChangeThreshold: 10,
        reminderSpeech: "Teleport soon",
      },
      {
        duration: 60,
        title: "Dispel",
        colorChangeThreshold: 10,
        reminderSpeech: "Dispel soon",
      },
      { duration: 240, title: "Jail", reminderSpeech: "Jail soon" },
      { duration: 150, title: "Gargoyles", reminderSpeech: "Gargoyles soon" },
      { duration: 120, title: "Golem", reminderSpeech: "Golem soon" },
      { duration: 150, title: "Smoke", reminderSpeech: "Smoke soon" },
      { isSeparator: true },
      {
        duration: 15,
        title: "First Teleport",
        colorChangeThreshold: 10,
        reminderSpeech: "Teleport soon",
      },
      { duration: 180, title: "First Jail", reminderSpeech: "Jail soon" },
      {
        duration: 90,
        title: "First Gargoyles",
        reminderSpeech: "Gargoyles soon",
      },
    ],
  },
];

export default timerConfigs;
