import MainMenu from '../components/MainMenu';
import React from 'react';

export default function AppBar() {
  return (
    <div className="flex panel-highlight rounded-lg py-2 justify-between">
      <div className="items-start">
        <MainMenu />
      </div>
    </div>
  );
}
