import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGasPump } from '@fortawesome/free-solid-svg-icons';

function VehicleHUD({ vehicleData }) {
  if (!vehicleData || !vehicleData.isInVehicle) {
    return null;
  }

  const { speed, fuel, rpm, gear } = vehicleData;
  
  const formattedSpeed = speed.toString().padStart(3, '0');
  
  const gearDisplay = gear === 0 ? "N" : gear;
  
  const fuelBarHeight = `${fuel}%`;
  
  const totalRpmBars = 15;
  const activeRpmBars = Math.round((rpm / 100) * totalRpmBars);

  return (
    <div className="vehicle-hud-minimal">
      <div className="kph-container">
        <div className="speed-unit">KMT</div>
      </div>
      
      <div className="speedometer-container">
        <div className="minimal-speed">{formattedSpeed}</div>
      </div>
      
      <div className="gear-indicator-container">
        <div className="green-gear-box">{gearDisplay}</div>
      </div>
      
      <div className="rpm-bars-container">
        <div className="minimal-rpm-bars">
          {[...Array(totalRpmBars)].map((_, index) => (
            <div 
              key={index} 
              className={`rpm-bar ${index < activeRpmBars ? 'active' : ''}`}
            ></div>
          ))}
        </div>
      </div>
      
      <div className="fuel-icon-container">
        <div className="minimal-fuel-icon">
          <FontAwesomeIcon icon={faGasPump} />
        </div>
      </div>
      
      <div className="fuel-indicator-container">
        <div className="vertical-fuel-indicator">
          <div 
            className="fuel-level"
            style={{ height: fuelBarHeight }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default VehicleHUD; 