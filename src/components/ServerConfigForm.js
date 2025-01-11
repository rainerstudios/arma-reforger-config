import React, { useState, useEffect, useMemo, useCallback } from 'react';

// Icons as components
const SearchIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="w-4 h-4 text-gray-400"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const CloseIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="w-4 h-4 text-blue-700"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// Sample local data for instant loading
const LOCAL_WORKSHOP_DATA = {
  "data": [
    {
      "id": "59727DAE364DEADB",
      "name": "WeaponSwitching",
      "scenariosIds": []
    },
    {
      "id": "59727DAE32981C7D",
      "name": "Enhanced Combat",
      "scenariosIds": []
    },
    {
      "id": "597146C56DF0866B",
      "name": "Better Grass",
      "scenariosIds": []
    }
  ]
};

const ConfigInput = React.memo(({ label, type = "text", name, defaultValue, onChange, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      name={name}
      defaultValue={defaultValue}
      onChange={onChange}
      className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      {...props}
    />
  </div>
));

const ConfigCheckbox = React.memo(({ label, name, defaultChecked, onChange }) => (
  <div>
    <label className="flex items-center">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        onChange={onChange}
        className="text-blue-600 border-gray-300 rounded shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
      <span className="ml-2 text-sm text-gray-600">{label}</span>
    </label>
  </div>
));

const FormSection = React.memo(({ title, children }) => (
  <div className="mb-6">
    <h3 className="mb-4 text-lg font-medium text-gray-900">{title}</h3>
    <div className="space-y-4">
      {children}
    </div>
  </div>
));

// Enhanced Mod Selector Component
const ModSelector = React.memo(({ selectedMods = [], onChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [workshopData, setWorkshopData] = useState(LOCAL_WORKSHOP_DATA);

  useEffect(() => {
    const fetchWorkshopData = async () => {
      try {
        const cachedData = localStorage.getItem('reforger-workshop-cache');
        const cacheTime = localStorage.getItem('reforger-workshop-cache-time');
        const cacheAge = Date.now() - parseInt(cacheTime || 0);
        
        if (cachedData && cacheAge < 3600000) {
          setWorkshopData(JSON.parse(cachedData));
          return;
        }

        const response = await fetch('https://files.ofpisnotdead.com/reforger-workshop.json');
        if (!response.ok) throw new Error('Failed to fetch workshop data');
        
        const data = await response.json();
        localStorage.setItem('reforger-workshop-cache', JSON.stringify(data));
        localStorage.setItem('reforger-workshop-cache-time', Date.now().toString());
        setWorkshopData(data);
      } catch (error) {
        console.error('Error fetching workshop data:', error);
      }
    };

    fetchWorkshopData();
  }, []);

  const filteredMods = useMemo(() => {
    if (!workshopData?.data) return [];
    return workshopData.data.filter(mod =>
      mod.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [workshopData, searchTerm]);

  const handleModSelect = useCallback((mod) => {
    const isSelected = selectedMods.some(selected => selected.modId === mod.id);
    let newMods = isSelected
      ? selectedMods.filter(selected => selected.modId !== mod.id)
      : [...selectedMods, { modId: mod.id, name: mod.name, version: "" }];
    onChange(newMods);
  }, [selectedMods, onChange]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute transform -translate-y-1/2 left-3 top-1/2">
          <SearchIcon />
        </div>
        <input
          type="text"
          placeholder="Search mods..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {selectedMods.length > 0 && (
        <div className="mb-4">
          <h4 className="mb-2 text-sm font-medium text-gray-700">Selected Mods:</h4>
          <div className="space-y-2">
            {selectedMods.map(mod => (
              <div
                key={mod.modId}
                className="flex items-center justify-between px-3 py-2 rounded-md bg-blue-50"
              >
                <span className="text-sm text-blue-700">{mod.name}</span>
                <button
                  onClick={() => handleModSelect({ id: mod.modId, name: mod.name })}
                  className="p-1 rounded-full hover:bg-blue-100"
                  type="button"
                >
                  <CloseIcon />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-y-auto border border-gray-200 divide-y rounded-md max-h-96">
        {filteredMods.map(mod => (
          <div
            key={mod.id}
            className={`flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer ${
              selectedMods.some(selected => selected.modId === mod.id)
                ? 'bg-blue-50'
                : ''
            }`}
            onClick={() => handleModSelect(mod)}
            role="button"
            tabIndex={0}
          >
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">{mod.name}</h3>
              <p className="text-sm text-gray-500">ID: {mod.id}</p>
            </div>
            <input
              type="checkbox"
              checked={selectedMods.some(selected => selected.modId === mod.id)}
              onChange={() => handleModSelect(mod)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
});

const PlatformButton = React.memo(({ platform, isSelected, onClick, disabled }) => {
  const platformNames = {
    "PLATFORM_PC": "PC",
    "PLATFORM_XBL": "Xbox", 
    "PLATFORM_PSN": "PlayStation"
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
        ${isSelected 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
        ${disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : ''}`}
    >
      {platformNames[platform]}
    </button>
  );
});

function ServerConfigForm() {
  const [networkConfig, setNetworkConfig] = useState({
    bindAddress: '',
    bindPort: 2001,
    publicAddress: '',
    publicPort: 2001,
  });

  const [a2sConfig, setA2sConfig] = useState({
    address: '',
    port: 17777
  });

  const [gameBasicConfig, setGameBasicConfig] = useState({
    name: '',
    password: '',
    passwordAdmin: '',
    scenarioId: '',
    playerCountLimit: 32,
    visible: true,
  });

  const [gameProperties, setGameProperties] = useState({
    serverMaxViewDistance: 1600,
    serverMinGrassDistance: 0,
    networkViewDistance: 1500,
    disableThirdPerson: false,
    fastValidation: true,
    battlEye: true,
    VONDisableUI: false,
    VONDisableDirectSpeechUI: false,
    missionHeader: {}
  });

  const [operatingConfig, setOperatingConfig] = useState({
    lobbyPlayerSynchronise: true,
    playerSaveTime: 120,
    aiLimit: -1
  });

  const [supportedPlatforms, setSupportedPlatforms] = useState(["PLATFORM_PC"]);
  const [mods, setMods] = useState([]);
  const [workshopData, setWorkshopData] = useState(null);

  useEffect(() => {
    const fetchWorkshopData = async () => {
      try {
        const cachedData = localStorage.getItem('reforger-workshop-cache');
        if (cachedData) {
          setWorkshopData(JSON.parse(cachedData));
        }
        
        const response = await fetch('https://files.ofpisnotdead.com/reforger-workshop.json');
        if (!response.ok) throw new Error('Failed to fetch workshop data');
        
        const data = await response.json();
        localStorage.setItem('reforger-workshop-cache', JSON.stringify(data));
        setWorkshopData(data);
      } catch (error) {
        console.error('Error fetching workshop data:', error);
      }
    };

    fetchWorkshopData();
  }, []);

  const createDebouncedHandler = (setter) => {
    let timeoutId;
    return (e) => {
      const { name, value, type, checked } = e.target;
      const finalValue = type === 'checkbox' ? checked : 
                        type === 'number' ? Number(value) : 
                        value;

      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setter(prev => ({
          ...prev,
          [name]: finalValue
        }));
      }, 100);
    };
  };

  const handleNetworkChange = createDebouncedHandler(setNetworkConfig);
  const handleA2SChange = createDebouncedHandler(setA2sConfig);
  const handleGameBasicChange = createDebouncedHandler(setGameBasicConfig);
  const handleGamePropertiesChange = createDebouncedHandler(setGameProperties);
  const handleOperatingChange = createDebouncedHandler(setOperatingConfig);

  const handlePlatformChange = useCallback((platform) => {
    setSupportedPlatforms(prev => {
      let newPlatforms = [...prev];
      
      if (newPlatforms.includes(platform)) {
        newPlatforms = newPlatforms.filter(p => p !== platform);
      } else {
        newPlatforms.push(platform);
      }

      if (!newPlatforms.includes("PLATFORM_PC")) {
        newPlatforms.push("PLATFORM_PC");
      }

      if (platform === "PLATFORM_PSN" && mods.length > 0) {
        newPlatforms = newPlatforms.filter(p => p !== "PLATFORM_PSN");
      }

      return newPlatforms;
    });
  }, [mods]);

  const handleExport = useCallback(() => {
    const formData = {
      ...networkConfig,
      a2s: a2sConfig,
      operating: operatingConfig,
      game: {
        ...gameBasicConfig,
        supportedPlatforms,
        mods,
        gameProperties
      }
    };

    const fileData = JSON.stringify(formData, null, 2);
    const blob = new Blob([fileData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "arma_server_config.json";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [networkConfig, a2sConfig, operatingConfig, gameBasicConfig, supportedPlatforms, mods, gameProperties]);

  const ScenarioSelection = useMemo(() => {
    const scenarios = workshopData?.data
      .filter(item => item.scenariosIds?.length > 0)
      .map(item => ({
        label: item.name,
        options: item.scenariosIds.map(scenario => ({
          value: scenario,
          label: scenario
        }))
      })) || [];

    const vanillaScenarios = [
      {
        label: 'Official Scenarios',
        options: [
          { value: '{90F086877C27B6F6}Missions/99_Tutorial.conf', label: 'Tutorial' },
          { value: '{ECC61978EDCC2B5A}Missions/23_Campaign.conf', label: 'Campaign' },
          { value: '{59AD59368755F41A}Missions/21_GM_Eden.conf', label: 'Game Master - Eden' }
        ]
      }
    ];

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700">Scenario ID</label>
        <select
          name="scenarioId"
          defaultValue={gameBasicConfig.scenarioId}
          onChange={handleGameBasicChange}
          className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Select a scenario...</option>
          {[...vanillaScenarios, ...scenarios].map(group => (
            <optgroup key={group.label} label={group.label}>
              {group.options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
    );
  }, [workshopData, handleGameBasicChange, gameBasicConfig.scenarioId]);

  const PlatformSection = useMemo(() => {
    const hasMods = mods.length > 0;
    
    return (
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">Supported Platforms</label>
        <div className="flex flex-wrap gap-2">
          {[
            { id: "PLATFORM_PC", name: "PC" },
            { id: "PLATFORM_XBL", name: "Xbox" },
            { id: "PLATFORM_PSN", name: "PlayStation" }
          ].map((platform) => (
            <PlatformButton
              key={platform.id}
              platform={platform.id}
              isSelected={supportedPlatforms.includes(platform.id)}
              onClick={() => handlePlatformChange(platform.id)}
              disabled={platform.id === "PLATFORM_PC" || (platform.id === "PLATFORM_PSN" && hasMods)}
            />
          ))}
        </div>
        {hasMods && (
          <p className="text-sm text-yellow-600">
            PlayStation support is disabled when mods are present.
          </p>
        )}
      </div>
    );
  }, [supportedPlatforms, handlePlatformChange, mods]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <form className="space-y-6">
        <FormSection title="Network Configuration">
          <div className="grid grid-cols-2 gap-4">
            <ConfigInput
              label="Bind Address"
              name="bindAddress"
              defaultValue={networkConfig.bindAddress}
              onChange={handleNetworkChange}
            />
            <ConfigInput
              label="Bind Port"
              type="number"
              name="bindPort"
              defaultValue={networkConfig.bindPort}
              onChange={handleNetworkChange}
            />
            <ConfigInput
              label="Public Address"
              name="publicAddress"
              defaultValue={networkConfig.publicAddress}
              onChange={handleNetworkChange}
            />
            <ConfigInput
              label="Public Port"
              type="number"
              name="publicPort"
              defaultValue={networkConfig.publicPort}
              onChange={handleNetworkChange}
            />
          </div>
        </FormSection>

        <FormSection title="A2S Configuration">
          <div className="grid grid-cols-2 gap-4">
            <ConfigInput
              label="A2S Address"
              name="address"
              defaultValue={a2sConfig.address}
              onChange={handleA2SChange}
            />
            <ConfigInput
              label="A2S Port"
              type="number"
              name="port"
              defaultValue={a2sConfig.port}
              onChange={handleA2SChange}
            />
          </div>
        </FormSection>

        <FormSection title="Game Configuration">
          <div className="space-y-4">
            <ConfigInput
              label="Server Name"
              name="name"
              defaultValue={gameBasicConfig.name}
              onChange={handleGameBasicChange}
            />
            <ConfigInput
              label="Server Password"
              type="password"
              name="password"
              defaultValue={gameBasicConfig.password}
              onChange={handleGameBasicChange}
            />
            <ConfigInput
              label="Admin Password"
              type="password"
              name="passwordAdmin"
              defaultValue={gameBasicConfig.passwordAdmin}
              onChange={handleGameBasicChange}
            />
            {ScenarioSelection}
            <ConfigInput
              label="Player Limit"
              type="number"
              name="playerCountLimit"
              defaultValue={gameBasicConfig.playerCountLimit}
              onChange={handleGameBasicChange}
              min="1"
              max="256"
            />
            <ConfigCheckbox
              label="Visible in server browser"
              name="visible"
              defaultChecked={gameBasicConfig.visible}
              onChange={handleGameBasicChange}
            />
            <ModSelector 
              selectedMods={mods}
              onChange={setMods}
            />
            {PlatformSection}
          </div>
        </FormSection>

        <FormSection title="Game Properties">
          <div className="grid grid-cols-2 gap-4">
            <ConfigInput
              label="Max View Distance"
              type="number"
              name="serverMaxViewDistance"
              defaultValue={gameProperties.serverMaxViewDistance}
              onChange={handleGamePropertiesChange}
              min="500"
              max="10000"
            />
            <ConfigInput
              label="Min Grass Distance"
              type="number"
              name="serverMinGrassDistance"
              defaultValue={gameProperties.serverMinGrassDistance}
              onChange={handleGamePropertiesChange}
              min="0"
              max="150"
            />
            <ConfigInput
              label="Network View Distance"
              type="number"
              name="networkViewDistance"
              defaultValue={gameProperties.networkViewDistance}
              onChange={handleGamePropertiesChange}
              min="500"
              max="5000"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <ConfigCheckbox
              label="Fast Validation"
              name="fastValidation"
              defaultChecked={gameProperties.fastValidation}
              onChange={handleGamePropertiesChange}
            />
            <ConfigCheckbox
              label="BattlEye"
              name="battlEye"
              defaultChecked={gameProperties.battlEye}
              onChange={handleGamePropertiesChange}
            />
            <ConfigCheckbox
              label="Disable Third Person"
              name="disableThirdPerson"
              defaultChecked={gameProperties.disableThirdPerson}
              onChange={handleGamePropertiesChange}
            />
            <ConfigCheckbox
              label="Disable VON UI"
              name="VONDisableUI"
              defaultChecked={gameProperties.VONDisableUI}
              onChange={handleGamePropertiesChange}
            />
            <ConfigCheckbox
              label="Disable Direct Speech UI"
              name="VONDisableDirectSpeechUI"
              defaultChecked={gameProperties.VONDisableDirectSpeechUI}
              onChange={handleGamePropertiesChange}
            />
          </div>
        </FormSection>

        <FormSection title="Operating">
          <div className="grid grid-cols-2 gap-4">
            <ConfigInput
              label="Player Save Time"
              type="number"
              name="playerSaveTime"
              defaultValue={operatingConfig.playerSaveTime}
              onChange={handleOperatingChange}
            />
            <ConfigInput
              label="AI Limit"
              type="number"
              name="aiLimit"
              defaultValue={operatingConfig.aiLimit}
              onChange={handleOperatingChange}
            />
            <ConfigCheckbox
              label="Lobby Player Synchronise"
              name="lobbyPlayerSynchronise"
              defaultChecked={operatingConfig.lobbyPlayerSynchronise}
              onChange={handleOperatingChange}
            />
          </div>
        </FormSection>

        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={handleExport}
            className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Export Config
          </button>
        </div>
      </form>
    </div>
  );
}

export default ServerConfigForm;