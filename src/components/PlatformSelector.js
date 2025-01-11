import React from 'react';

const PlatformSelector = ({ platforms, onChange, formData }) => {
  const hasMods = formData.game.mods && formData.game.mods.length > 0;

  const handlePlatformChange = (platform) => {
    let newPlatforms = [...platforms];
    
    if (newPlatforms.includes(platform)) {
      newPlatforms = newPlatforms.filter(p => p !== platform);
    } else {
      newPlatforms.push(platform);
    }

    if (!newPlatforms.includes("PLATFORM_PC")) {
      newPlatforms.push("PLATFORM_PC");
    }

    if (platform === "PLATFORM_PSN" && hasMods) {
      newPlatforms = newPlatforms.filter(p => p !== "PLATFORM_PSN");
    }

    onChange(newPlatforms);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">Supported Platforms</label>
      <div className="flex flex-wrap gap-2">
        {[
          { id: "PLATFORM_PC", name: "PC" },
          { id: "PLATFORM_XBL", name: "Xbox" },
          { id: "PLATFORM_PSN", name: "PlayStation" }
        ].map((platform) => (
          <button
            key={platform.id}
            type="button"
            onClick={() => handlePlatformChange(platform.id)}
            disabled={platform.id === "PLATFORM_PC" || (platform.id === "PLATFORM_PSN" && hasMods)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${platforms.includes(platform.id) 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
              ${(platform.id === "PLATFORM_PC" || (platform.id === "PLATFORM_PSN" && hasMods))
                ? 'opacity-75 cursor-not-allowed' 
                : ''}`}
          >
            {platform.name}
          </button>
        ))}
      </div>
      {hasMods && (
        <p className="text-sm text-yellow-600">
          PlayStation support is disabled when mods are present.
        </p>
      )}
      <p className="text-sm text-gray-500">
        PC platform is always required. PlayStation and Xbox availability depends on server configuration.
      </p>
    </div>
  );
};

export default PlatformSelector;
