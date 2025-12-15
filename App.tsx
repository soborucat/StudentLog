import React, { useState, useEffect } from 'react';
import ConfigScreen from './components/ConfigScreen';
import MainForm from './components/MainForm';
import { FormConfig } from './types';

const App: React.FC = () => {
  const [config, setConfig] = useState<FormConfig | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Load config from local storage
    const savedConfig = localStorage.getItem('form_config');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error("Failed to parse config", e);
      }
    } else {
        setIsConfiguring(true);
    }
    setLoaded(true);
  }, []);

  const handleSaveConfig = (newConfig: FormConfig) => {
    setConfig(newConfig);
    localStorage.setItem('form_config', JSON.stringify(newConfig));
    setIsConfiguring(false);
  };

  const handleOpenSettings = () => {
    setIsConfiguring(true);
  };

  const handleCancelConfig = () => {
      // If we have a valid config, we can cancel editing. 
      // If no config exists, we must stay on the config screen.
      if (config) {
          setIsConfiguring(false);
      }
  };

  if (!loaded) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {isConfiguring ? (
          <ConfigScreen 
            initialConfig={config} 
            onSave={handleSaveConfig} 
            onCancel={config ? handleCancelConfig : () => {}}
          />
        ) : (
          config ? (
            <MainForm 
                config={config} 
                onOpenSettings={handleOpenSettings}
            />
          ) : (
            // Fallback (shouldn't happen due to logic above)
            <div className="text-center p-4">Loading...</div>
          )
        )}
      </div>
      
      {!isConfiguring && (
        <footer className="mt-8 text-center text-xs text-gray-400">
          <p>데이터는 사용자의 브라우저에 저장되며,</p>
          <p>설문 제출 시 구글 폼으로 직접 전송됩니다.</p>
        </footer>
      )}
    </div>
  );
};

export default App;