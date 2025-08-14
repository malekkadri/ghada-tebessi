import React, { useState } from 'react';

const SettingsPanel: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [sidebarTheme, setSidebarTheme] = useState<'light' | 'dark'>('light');

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const handleSidebarThemeChange = (theme: 'light' | 'dark') => {
    setSidebarTheme(theme);
  };

  return (
    <div className="container-fluid page-body-wrapper">
      <div className="theme-setting-wrapper">
        <div id="settings-trigger" onClick={toggleSettings}>
          <i className="typcn typcn-cog-outline"></i>
        </div>

        {isSettingsOpen && (
          <div id="theme-settings" className="settings-panel">
            <i className="settings-close typcn typcn-delete-outline" onClick={toggleSettings}></i>

            <p className="settings-heading">SIDEBAR SKINS</p>
            <div
              className={`sidebar-bg-options ${sidebarTheme === 'light' ? 'selected' : ''}`}
              id="sidebar-light-theme"
              onClick={() => handleSidebarThemeChange('light')}
            >
              <div className="img-ss rounded-circle bg-light border mr-3"></div>
              Light
            </div>
            <div
              className={`sidebar-bg-options ${sidebarTheme === 'dark' ? 'selected' : ''}`}
              id="sidebar-dark-theme"
              onClick={() => handleSidebarThemeChange('dark')}
            >
              <div className="img-ss rounded-circle bg-dark border mr-3"></div>
              Dark
            </div>

            <p className="settings-heading mt-2">HEADER SKINS</p>
            <div className="color-tiles mx-0 px-4">
              <div className="tiles success"></div>
              <div className="tiles warning"></div>
              <div className="tiles danger"></div>
              <div className="tiles primary"></div>
              <div className="tiles info"></div>
              <div className="tiles dark"></div>
              <div className="tiles default border"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;