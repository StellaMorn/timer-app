import { useState } from "react";
import timerConfigs from "../timerConfigs";

const ConfigToggle = ({ onConfigChange }) => {
  const [selectedConfig, setSelectedConfig] = useState(timerConfigs[0].id);

  const handleConfigChange = (e) => {
    const configId = parseInt(e.target.value, 10);
    setSelectedConfig(configId);
    const config = timerConfigs.find((config) => config.id === configId);
    onConfigChange(config);
  };

  return (
    <div>
      <label htmlFor="config-select" className="mr-2">
        Select Configuration:
      </label>
      <select
        id="config-select"
        data-testid="config-select"
        value={selectedConfig}
        onChange={handleConfigChange}
        className="py-1 px-2 rounded border border-gray-300"
      >
        {timerConfigs.map((config) => (
          <option key={config.id} value={config.id}>
            {config.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ConfigToggle;