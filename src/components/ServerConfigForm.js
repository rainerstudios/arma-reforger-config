import React, { useState } from 'react';

// Platform selector component inlined
const PlatformButton = ({ platform, isSelected, onClick, disabled }) => {
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
};

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

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const keys = name.split('.');
    
    setFormData(prevData => {
      let newData = { ...prevData };
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = type === 'checkbox' ? checked : 
                                      type === 'number' ? Number(value) : 
                                      value;
      return newData;
    });
  };
    // Add mod change
    const handleModChange = (mods) => {
        setFormData(prevData => {
          const newData = {
            ...prevData,
            game: {
              ...prevData.game,
              mods: mods.map(mod => ({
                modId: mod.value,
                name: mod.label,
                version: ""
              }))
            }
          };
    
          if (mods.length > 0) {
            newData.game.supportedPlatforms = newData.game.supportedPlatforms.filter(
              platform => platform !== "PLATFORM_PSN"
            );
          }
    
          return newData;
        });
      };

  const handlePlatformChange = (platform) => {
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

      // Remove PS5 if mods are present
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
  };

  const handleExport = () => {
    const fileData = JSON.stringify(formData, null, 2);
    const blob = new Blob([fileData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `arma_server_config.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const FormSection = ({ title, children }) => (
    <div className="mb-6">
      <h3 className="mb-4 text-lg font-medium text-gray-900">{title}</h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
  
  

  // Platform selector section
  const PlatformSection = () => {
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
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <form className="space-y-6">
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
            <div>
              <label className="block text-sm font-medium text-gray-700">Scenario ID</label>
              <input
                type="text"
                name="game.scenarioId"
                value={formData.game.scenarioId}
                onChange={handleChange}
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
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
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Mods</label>
              <select
                multiple
                name="game.mods"
                className="block w-full py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.game.mods.map(mod => mod.modId)}
                onChange={(e) => {
                  const options = [...e.target.selectedOptions];
                  const selectedMods = options.map(option => ({
                    value: option.value,
                    label: option.text
                  }));
                  handleModChange(selectedMods);
                }}
              >
                <option value="59727DAE364DEADB">WeaponSwitching</option>
                <option value="59727DAE32981C7D">Explosive Goats beta</option>
                <option value="5972ABCD12345678">Example Mod 1</option>
                <option value="5972EFGH87654321">Example Mod 2</option>
              </select>
              <p className="mt-2 text-sm text-gray-500">
                Hold Ctrl (Windows) or Command (Mac) to select multiple mods
              </p>
              {formData.game.mods.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700">Selected Mods:</h4>
                  <ul className="mt-2 space-y-2">
                    {formData.game.mods.map(mod => (
                      <li key={mod.modId} className="text-sm text-gray-600">
                        {mod.name} ({mod.modId})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <PlatformSection />
          </div>
        </FormSection>

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