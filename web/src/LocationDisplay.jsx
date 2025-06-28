import React, { memo } from 'react';

const LocationDisplay = memo(function LocationDisplay({ zone, zoneName, streetName, crossing, hasCrossing, direction, gameTime }) {
  return (
    <div className="location-display">
      <div className="location-info">
        <div className="location-zone">{zoneName}</div>
        <div className="location-street">
          {streetName}
          {hasCrossing && crossing && (
            <span className="location-crossing">{crossing}</span>
          )}
        </div>
        {direction && (
          <div className="location-direction">
            {direction}
          </div>
        )}
        {gameTime && (
          <div className="location-time">
            {gameTime}
          </div>
        )}
      </div>
    </div>
  );
});

export default LocationDisplay; 