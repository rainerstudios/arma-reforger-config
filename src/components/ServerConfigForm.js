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

// Enhanced Mod Selector Component
const ModSelector = React.memo(({ selectedMods = [], onChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

    setTimeout(fetchWorkshopData, 100);
  }, []);

  const filteredMods = useMemo(() => {
    if (!workshopData?.data) return [];
    return workshopData.data.filter(mod =>
      mod.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [workshopData, searchTerm]);

  const handleModSelect = useCallback((mod) => {
    const isSelected = selectedMods.some(selected => selected.modId === mod.id);
    let newMods;
    
    if (isSelected) {
      newMods = selectedMods.filter(selected => selected.modId !== mod.id);
    } else {
      newMods = [...selectedMods, { modId: mod.id, name: mod.name, version: "" }];
    }
    
    onChange(newMods);
  }, [selectedMods, onChange]);

  if (isLoading && !workshopData) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

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

      <div className="space-y-2">
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
    </div>
  );
});

// Platform Button Component
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

// Form Section Component
const FormSection = React.memo(({ title, children }) => (
  <div className="mb-6">
    <h3 className="mb-4 text-lg font-medium text-gray-900">{title}</h3>
    <div className="space-y-4">
      {children}
    </div>
  </div>
));

function ServerConfigForm() {
  const [formData, setFormData] = useState({
    bindAddress: '',
    bindPort: 2001,
    publicAddress: '',
    publicPort: 2001,
    a2s: {
      address: '',
      port: 17777
    },
    operating: {
      lobbyPlayerSynchronise: true,
      playerSaveTime: 120,
      aiLimit: -1
    },
    game: {
      name: '',
      password: '',
      passwordAdmin: '',
      scenarioId: '',
      playerCountLimit: 32,
      visible: true,
      supportedPlatforms: ["PLATFORM_PC"],
      gameProperties: {
        serverMaxViewDistance: 1600,
        serverMinGrassDistance: 0,
        networkViewDistance: 1500,
        disableThirdPerson: false,
        fastValidation: true,
        battlEye: true,
        VONDisableUI: false,
        VONDisableDirectSpeechUI: false,
        missionHeader: {}
      },
      mods: []
    }
  });

  const [workshopData, setWorkshopData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWorkshopData = async () => {
      try {
        setIsLoading(true);
        const cachedData = localStorage.getItem('reforger-workshop-cache');
        
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          const cacheTime = localStorage.getItem('reforger-workshop-cache-time');
          const cacheAge = Date.now() - parseInt(cacheTime || 0);
          
          if (cacheAge < 3600000) {
            setWorkshopData(parsedData);
            setIsLoading(false);
            return;
          }
        }
        
        const response = await fetch('https://files.ofpisnotdead.com/reforger-workshop.json');
        if (!response.ok) throw new Error('Failed to fetch workshop data');
        
        const data = await response.json();
        localStorage.setItem('reforger-workshop-cache', JSON.stringify(data));
        localStorage.setItem('reforger-workshop-cache-time', Date.now().toString());
        setWorkshopData(data);
      } catch (error) {
        console.error('Error fetching workshop data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    setTimeout(fetchWorkshopData, 100);
  }, []);

  const handleChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    const keys = name.split('.');
    
    setFormData(prevData => {
      const newData = { ...prevData };
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = type === 'checkbox' ? checked : 
                                      type === 'number' ? Number(value) : 
                                      value;
      return newData;
    });
  }, []);

  const handlePlatformChange = useCallback((platform) => {
    setFormData(prevData => {
      let newPlatforms = [...prevData.game.supportedPlatforms];
      
      if (newPlatforms.includes(platform)) {
        newPlatforms = newPlatforms.filter(p => p !== platform);
      } else {
        newPlatforms.push(platform);
      }

      if (!newPlatforms.includes("PLATFORM_PC")) {
        newPlatforms.push("PLATFORM_PC");
      }

      if (platform === "PLATFORM_PSN" && prevData.game.mods.length > 0) {
        newPlatforms = newPlatforms.filter(p => p !== "PLATFORM_PSN");
      }

      return {
        ...prevData,
        game: {
          ...prevData.game,
          supportedPlatforms: newPlatforms
        }
      };
    });
  }, []);

  const handleExport = useCallback(() => {
    const fileData = JSON.stringify(formData, null, 2);
    const blob = new Blob([fileData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "arma_server_config.json";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [formData]);

  // Scenarios
  const ScenarioSelection = React.memo(() => {
    const scenarios = useMemo(() => {
      if (!workshopData) return [];

      const workshopScenarios = workshopData.data
        .filter(item => item.scenariosIds?.length > 0)
        .map(item => ({
          label: item.name,
          options: item.scenariosIds.map(scenario => ({
            value: scenario,
            label: scenario
          }))
        }));

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

      return [...vanillaScenarios, ...workshopScenarios];
    }, [workshopData]);

    if (isLoading) return <div className="h-10 bg-gray-200 rounded animate-pulse"></div>;

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700">Scenario ID</label>
        <select
          name="game.scenarioId"
          value={formData.game.scenarioId}
          onChange={handleChange}
          className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Select a scenario...</option>
          {scenarios.map(group => (
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
  });

  // Platform selector section
  const PlatformSection = React.memo(() => {
    const hasMods = formData.game.mods && formData.game.mods.length > 0;
    
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
              isSelected={formData.game.supportedPlatforms.includes(platform.id)}
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
  });

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <form className="space-y-6">
        {/* Network Configuration section */}
        <FormSection title="Network Configuration">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Bind Address</label>
              <input
                type="text"
                name="bindAddress"
                value={formData.bindAddress}
                onChange={handleChange}
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bind Port</label>
              <input
                type="number"
                name="bindPort"
                value={formData.bindPort}
                onChange={handleChange}
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Public Address</label>
              <input
                type="text"
                name="publicAddress"
                value={formData.publicAddress}
                onChange={handleChange}
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Public Port</label>
              <input
                type="number"
                name="publicPort"
                value={formData.publicPort}
                onChange={handleChange}
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </FormSection>

        {/* A2S Configuration section */}
        <FormSection title="A2S Configuration">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">A2S Address</label>
              <input
                type="text"
                name="a2s.address"
                value={formData.a2s.address}
                onChange={handleChange}
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">A2S Port</label>
              <input
                type="number"
                name="a2s.port"
                value={formData.a2s.port}
                onChange={handleChange}
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </FormSection>

        {/* Game Configuration section */}
        <FormSection title="Game Configuration">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Server Name</label>
              <input
                type="text"
                name="game.name"
                value={formData.game.name}
                onChange={handleChange}
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Server Password</label>
              <input
                type="password"
                name="game.password"
                value={formData.game.password}
                onChange={handleChange}
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Admin Password</label>
              <input
                type="password"
                name="game.passwordAdmin"
                value={formData.game.passwordAdmin}
                onChange={handleChange}
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <ScenarioSelection />

            <div>
              <label className="block text-sm font-medium text-gray-700">Player Limit</label>
              <input
                type="number"
                name="game.playerCountLimit"
                value={formData.game.playerCountLimit}
                onChange={handleChange}
                min="1"
                max="256"
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="game.visible"
                  checked={formData.game.visible}
                  onChange={handleChange}
                  className="text-blue-600 border-gray-300 rounded shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">Visible in server browser</span>
              </label>
            </div>

            <ModSelector 
              selectedMods={formData.game.mods}
              onChange={(mods) => {
                setFormData(prevData => ({
                  ...prevData,
                  game: {
                    ...prevData.game,
                    mods,
                    supportedPlatforms: mods.length > 0 
                      ? prevData.game.supportedPlatforms.filter(p => p !== "PLATFORM_PSN")
                      : prevData.game.supportedPlatforms
                  }
                }));
              }}
            />
            <PlatformSection />
          </div>
        </FormSection>

        {/* Game Properties section */}
        <FormSection title="Game Properties">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Max View Distance</label>
              <input
                type="number"
                name="game.gameProperties.serverMaxViewDistance"
                value={formData.game.gameProperties.serverMaxViewDistance}
                onChange={handleChange}
                min="500"
                max="10000"
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Min Grass Distance</label>
              <input
                type="number"
                name="game.gameProperties.serverMinGrassDistance"
                value={formData.game.gameProperties.serverMinGrassDistance}
                onChange={handleChange}
                min="0"
                max="150"
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Network View Distance</label>
              <input
                type="number"
                name="game.gameProperties.networkViewDistance"
                value={formData.game.gameProperties.networkViewDistance}
                onChange={handleChange}
                min="500"
                max="5000"
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="game.gameProperties.fastValidation"
                  checked={formData.game.gameProperties.fastValidation}
                  onChange={handleChange}
                  className="text-blue-600 border-gray-300 rounded shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">Fast Validation</span>
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="game.gameProperties.battlEye"
                  checked={formData.game.gameProperties.battlEye}
                  onChange={handleChange}
                  className="text-blue-600 border-gray-300 rounded shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">BattlEye</span>
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="game.gameProperties.disableThirdPerson"
                  checked={formData.game.gameProperties.disableThirdPerson}
                  onChange={handleChange}
                  className="text-blue-600 border-gray-300 rounded shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">Disable Third Person</span>
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="game.gameProperties.VONDisableUI"
                  checked={formData.game.gameProperties.VONDisableUI}
                  onChange={handleChange}
                  className="text-blue-600 border-gray-300 rounded shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">Disable VON UI</span>
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="game.gameProperties.VONDisableDirectSpeechUI"
                  checked={formData.game.gameProperties.VONDisableDirectSpeechUI}
                  onChange={handleChange}
                  className="text-blue-600 border-gray-300 rounded shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">Disable Direct Speech UI</span>
              </label>
            </div>
          </div>
        </FormSection>

        {/* Operating section */}
        <FormSection title="Operating">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Player Save Time</label>
              <input
                type="number"
                name="operating.playerSaveTime"
                value={formData.operating.playerSaveTime}
                onChange={handleChange}
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">AI Limit</label>
              <input
                type="number"
                name="operating.aiLimit"
                value={formData.operating.aiLimit}
                onChange={handleChange}
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="operating.lobbyPlayerSynchronise"
                  checked={formData.operating.lobbyPlayerSynchronise}
                  onChange={handleChange}
                  className="text-blue-600 border-gray-300 rounded shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">Lobby Player Synchronise</span>
              </label>
            </div>
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