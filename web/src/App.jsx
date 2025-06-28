import { useState, useEffect, useLayoutEffect, useRef, memo } from 'react'
import './App.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faHeart, 
  faShieldHalved, 
  faBurger, 
  faDroplet,
  faMicrophone,
  faLungs
} from '@fortawesome/free-solid-svg-icons'
import VehicleHUD from './VehicleHUD'
import PlayerInfoHUD from './PlayerInfoHUD'
import TalkingIndicator from './TalkingIndicator'
import LocationDisplay from './LocationDisplay'

const isDev = process.env.NODE_ENV === 'development';

const healthColors = [
  { threshold: 25, color: 'progress-color-red' },
  { threshold: 75, color: 'progress-color-yellow' },
  { threshold: 101, color: 'progress-color-green' },
];

const armorColors = [
  { threshold: 25, color: 'progress-color-red' },
  { threshold: 75, color: 'progress-color-yellow' },
  { threshold: 101, color: 'progress-color-blue' },
];

const hungerColors = [
  { threshold: 25, color: 'progress-color-red' },
  { threshold: 75, color: 'progress-color-yellow' },
  { threshold: 101, color: 'progress-color-green' },
];

const thirstColors = [
  { threshold: 25, color: 'progress-color-red' },
  { threshold: 75, color: 'progress-color-cyan' },
  { threshold: 101, color: 'progress-color-blue' },
];

const ProgressBar = memo(function ProgressBar({ icon, value, max = 100, colored = false, color = 'progress-color-blue', width = 'small' }) {
  const percent = Math.min(Math.max(Math.round((value / max) * 100), 0), 100);
  
  let colorClass = color;
  
  if (icon.props.icon === faHeart) {
    colorClass = 'progress-color-red';
  } 
  else if (icon.props.icon === faShieldHalved) {
    colorClass = 'progress-color-blue';
  }
  else if (icon.props.icon === faBurger) {
    colorClass = 'progress-color-yellow';
  }
  else if (icon.props.icon === faDroplet) {
    colorClass = 'progress-color-cyan';
  }
  
  const widthClass = width === 'large' ? 'progress-width-large' : 'progress-width-small';
  
  return (
    <div className={`progress-container ${widthClass}`}>
      <div className="progress-bar-bg">
        <div 
          className={`progress-bar-fill ${colorClass}`} 
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="progress-bar-icon">
        {icon}
      </div>
    </div>
  );
});

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const messageQueue = {
  processing: false,
  lastPlayerData: null,
  vehicleTimer: null,
  playerStatusTimer: null
};

const mockPlayerData = {
  money: 12500,
  bank: 156780,
  black_money: 4500,
  job: "Police",
  jobGrade: "Lieutenant",
  playerId: 1,
  playerCount: 32
};

function App() {
  const [dateTime, setDateTime] = useState(new Date());
  const [visible, setVisible] = useState(isDev);
  const [playerData, setPlayerData] = useState(null);
  const [playerStatus, setPlayerStatus] = useState({
    health: 100,
    armor: 0,
    hunger: 100,
    thirst: 100,
    oxygen: 100
  });
  const [talkingState, setTalkingState] = useState({
    isTalking: false,
    voiceMode: 1,
    isRadio: false
  });

  const [locationState, setLocationState] = useState({
    zone: isDev ? "VINEWOOD" : "",
    zoneName: isDev ? "Vinewood" : "",
    streetName: isDev ? "Vinewood Boulevard" : "",
    crossing: isDev ? "Power Street" : "",
    hasCrossing: isDev ? true : false,
    direction: isDev ? "N" : "",
    gameTime: isDev ? "12:00" : ""
  });
  const [config, setConfig] = useState({
    timeFormat: 24,
    showDate: true,
    locale: 'da-DK',
    statusDisplay: {
      position: "bottom-right",
      showHealthPercent: true,
      showArmorPercent: true,
      showHungerPercent: true,
      showThirstPercent: true,
      coloredHealth: true,
      coloredArmor: true,
      coloredHunger: true,
      coloredThirst: true
    }
  });
  const [vehicleData, setVehicleData] = useState(null);
  
  const [isVisible, setIsVisible] = useState(true);
  const [isPlayerInfoVisible, setIsPlayerInfoVisible] = useState(true);
  
  const prevStatusRef = useRef({
    health: playerStatus.health,
    armor: playerStatus.armor,
    hunger: playerStatus.hunger,
    thirst: playerStatus.thirst
  });
  
  const intervalRef = useRef({
    dateTime: null,
    playerStatus: null,
    talking: null
  });
  
  const [isInWater, setIsInWater] = useState(false);
  
  useEffect(() => {
    const handleNUIMessages = (event) => {
      if (event.data.action === 'updateVehicleHud') {
        if (messageQueue.vehicleTimer) {
          cancelAnimationFrame(messageQueue.vehicleTimer);
        }
        
        messageQueue.vehicleTimer = requestAnimationFrame(() => {
          window.vehicleData = event.data.vehicleData;
          messageQueue.vehicleTimer = null;
        });
      } 
      else if (event.data.action === 'updatePlayerInfo') {
        if (messageQueue.processing) return;
        
        const newData = event.data.playerData;
        if (!newData) return;
        
        if (typeof newData.money !== 'number') newData.money = parseInt(newData.money) || 0;
        if (typeof newData.bank !== 'number') newData.bank = parseInt(newData.bank) || 0;
        if (typeof newData.black_money !== 'number') newData.black_money = parseInt(newData.black_money) || 0;
        
        if (messageQueue.lastPlayerData) {
          const isEqual = JSON.stringify(messageQueue.lastPlayerData) === JSON.stringify(newData);
          if (isEqual) return; 
        }
        
        messageQueue.processing = true;
        
        messageQueue.lastPlayerData = {...newData};
        
        requestAnimationFrame(() => {
          window.playerData = messageQueue.lastPlayerData;
          messageQueue.processing = false;
        });
      }
      else if (event.data.action === 'updatePlayerStatus') {
        if (event.data.status) {
          if (messageQueue.playerStatusTimer) {
            cancelAnimationFrame(messageQueue.playerStatusTimer);
          }
          
          messageQueue.playerStatusTimer = requestAnimationFrame(() => {
            window.playerStatus = event.data.status;
            messageQueue.playerStatusTimer = null;
          });
        }
      }
      else if (event.data.action === 'updateLocation') {
        if (event.data.location) {
          window.locationData = event.data.location;
        }
      }
      else if (event.data.action === 'speak') {
        window.talkingStatus = window.talkingStatus || {};
        window.talkingStatus.isTalking = event.data.active;
      }
      else if (event.data.action === 'voice') {
        window.talkingStatus = window.talkingStatus || {};
        window.talkingStatus.voiceMode = parseInt(event.data.lvl) || 2; 
      }
      else if (event.data.action === 'radio') {
        window.talkingStatus = window.talkingStatus || {};
        window.talkingStatus.isRadio = event.data.active;
      }
      else if (event.data.type === 'updateHud') {
        if (event.data.status) {
          window.playerStatus = event.data.status;
        }
        
        if (event.data.vehicle && (!window.vehicleData || !window.vehicleData.isInVehicle)) {
          window.vehicleData = event.data.vehicle;
        }
        
        if (event.data.playerData) {
          if (!window.playerData) window.playerData = {};
          window.playerData.playerId = event.data.playerData.playerId;
          window.playerData.playerCount = event.data.playerData.playerCount;
        }
      }
      else if (event.data.action === 'toggleHud') {
        setVisible(!!event.data.visible);
      }
      else if (event.data.action === 'togglePlayerInfo') {
        setIsPlayerInfoVisible(!!event.data.visible);
      }
    };
    
    window.addEventListener('message', handleNUIMessages);
    
    return () => {
      window.removeEventListener('message', handleNUIMessages);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current.dateTime) clearInterval(intervalRef.current.dateTime);
      if (intervalRef.current.playerStatus) clearInterval(intervalRef.current.playerStatus);
      if (intervalRef.current.talking) clearInterval(intervalRef.current.talking);
    };
  }, []);

  useEffect(() => {
    const pollInterval = setInterval(() => {
      if (window.playerData && (!playerData || JSON.stringify(window.playerData) !== JSON.stringify(playerData))) {
        setPlayerData(window.playerData);
      }
      
      if (window.playerStatus) {
        const newStatus = window.playerStatus;
        setPlayerStatus(prevStatus => {
          if (JSON.stringify(prevStatus) === JSON.stringify(newStatus)) {
            return prevStatus; 
          }
          return newStatus;
        });
      }
      
      if (window.locationData) {
        const newLocation = window.locationData;
        setLocationState(prevLocation => {
          if (JSON.stringify(prevLocation) === JSON.stringify(newLocation)) {
            return prevLocation;
          }
          return newLocation;
        });
      }
      
      if (window.talkingStatus) {
        setTalkingState(prevState => {
          if (
            prevState.isTalking === window.talkingStatus.isTalking &&
            prevState.voiceMode === window.talkingStatus.voiceMode &&
            prevState.isRadio === window.talkingStatus.isRadio
          ) {
            return prevState; 
          }
          
          return {
            ...prevState,
            isTalking: window.talkingStatus.isTalking !== undefined ? window.talkingStatus.isTalking : prevState.isTalking,
            voiceMode: window.talkingStatus.voiceMode !== undefined ? window.talkingStatus.voiceMode : prevState.voiceMode,
            isRadio: window.talkingStatus.isRadio !== undefined ? window.talkingStatus.isRadio : prevState.isRadio
          };
        });
      }
      
      if (window.vehicleData) {
        const newVehicleData = window.vehicleData;
        setVehicleData(prevData => {
          if (JSON.stringify(prevData) === JSON.stringify(newVehicleData)) {
            return prevData; 
          }
          return newVehicleData;
        });
      }
    }, 100);
    
    intervalRef.current.playerStatus = pollInterval;
    
    return () => clearInterval(pollInterval);
  }, [playerData]);

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setDateTime(new Date());
    }, 1000);
    
    intervalRef.current.dateTime = timeInterval;
    
    return () => clearInterval(timeInterval);
  }, []);
  
  useEffect(() => {
    if (!isDev) return;
    
    let lastUpdateTime = Date.now();
    
    const simulateStatus = () => {
      const now = Date.now();
      const elapsed = now - lastUpdateTime;
      lastUpdateTime = now;
      
      if (elapsed < 250) return;
      
      setPlayerStatus(prev => {
        if (Math.random() > 0.2) return prev;
        
        return {
          health: Math.max(0, Math.min(100, prev.health + (Math.random() * 2 - 1))),
          armor: Math.max(0, Math.min(100, prev.armor + (Math.random() * 2 - 1))),
          hunger: Math.max(0, Math.min(100, prev.hunger + (Math.random() * 2 - 1))),
          thirst: Math.max(0, Math.min(100, prev.thirst + (Math.random() * 2 - 1))),
          oxygen: Math.max(0, Math.min(100, prev.oxygen + (Math.random() * 2 - 1)))
        };
      });
      
      if (Math.random() > 0.92) {
        setTalkingState(prev => {
          return {
            ...prev,
            isTalking: !prev.isTalking,
            voiceMode: Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : prev.voiceMode
          };
        });
      }
    };
    
    const interval = setInterval(simulateStatus, 250);
    
    return () => clearInterval(interval);
  }, [isDev]);

  useEffect(() => {
    const handleConfigAndVisibility = (event) => {
      const data = event.data;
      
      if (data.type === 'toggleHud') {
        setVisible(data.display);
      }
      
      if (data.type === 'setConfig' && data.config) {
        setConfig(data.config);
      }
    };
    
    window.addEventListener('message', handleConfigAndVisibility);
    
    let devInterval;
    if (isDev) {
      devInterval = setInterval(() => {
        setPlayerStatus(prev => {
          const randomHideHealth = Math.random() > 0.9 ? 0 : Math.max(30, Math.min(100, prev.health + (Math.random() * 10 - 5)));
          const randomHideArmor = Math.random() > 0.8 ? 0 : Math.max(0, Math.min(100, prev.armor + (Math.random() * 6 - 3)));
          const randomHideHunger = Math.random() > 0.85 ? 0 : Math.max(20, Math.min(100, prev.hunger + (Math.random() * 8 - 5)));
          const randomHideThirst = Math.random() > 0.88 ? 0 : Math.max(15, Math.min(100, prev.thirst + (Math.random() * 8 - 5)));
          
          return {
            health: randomHideHealth,
            armor: randomHideArmor,
            hunger: randomHideHunger,
            thirst: randomHideThirst,
            oxygen: Math.max(0, Math.min(100, prev.oxygen + (Math.random() * 2 - 1)))
          };
        });
        
        if (Math.random() > 0.7) {
          setTalkingState(prev => ({
            ...prev,
            isTalking: !prev.isTalking,
            voiceMode: Math.floor(Math.random() * 3) + 1 
          }));
        }
      }, 3000);
    }
    
    return () => {
      window.removeEventListener('message', handleConfigAndVisibility);
      if (devInterval) clearInterval(devInterval);
    };
  }, []);

  useEffect(() => {
    const handleMessage = (event) => {
      const data = event.data;
      
      if (data.action === 'toggleHud') {
        setVisible(data.visible);
      }
      
      if (data.action === 'togglePlayerInfo') {
        setIsPlayerInfoVisible(data.visible);
      }
      
      if (data.action === 'updateOxygenVisibility') {
        setIsInWater(data.isVisible);
      }
      
      if (data.action === 'updateOxygenLevel') {
        setPlayerStatus(prev => ({
          ...prev,
          oxygen: data.oxygen
        }));
      }
      
      if (data.action === 'setConfig' && data.config) {
        setConfig(prev => ({...prev, ...data.config}));
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const formatDateAndTime = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const formatPlayerInfo = () => {
    const playerCount = playerData?.playerCount ?? 0;
    const playerId = playerData?.playerId ?? 0;
    return `${playerCount} i Byen - Dit ID: ${playerId}`;
  };

  const isDevMode = import.meta.env.MODE === 'development';
  
  return visible ? (
    <div className="fivem-hud" style={{backgroundColor: 'transparent'}}>
      <div className="datetime-container">
        <div className="server-name">
          <img src="./logo.png" alt="Server Logo" style={{ height: '64px', verticalAlign: 'middle' }} />
        </div>
        <div className="datetime-line">{formatDateAndTime(dateTime)}</div>
        <div className="player-line">{formatPlayerInfo()}</div>
      </div>
      <div className="status-bar-container health-bar-container visible">
        <div className="progress-container">
          <div className="progress-bar-bg">
            <div 
              className="progress-bar-fill progress-color-red" 
              style={{ width: `${Math.min(Math.max(Math.round((playerStatus.health / 100) * 100), 0), 100)}%` }}
            />
          </div>
          <div className="progress-bar-icon">
            <FontAwesomeIcon icon={faHeart} />
          </div>
        </div>
      </div>
      <div className="status-bar-container armor-bar-container visible">
        <div className="progress-container">
          <div className="progress-bar-bg">
            <div 
              className="progress-bar-fill progress-color-blue" 
              style={{ width: `${Math.min(Math.max(Math.round((playerStatus.armor / 100) * 100), 0), 100)}%` }}
            />
          </div>
          <div className="progress-bar-icon">
            <FontAwesomeIcon icon={faShieldHalved} />
          </div>
        </div>
      </div>
      <div className="status-bar-container hunger-bar-container visible">
        <div className="progress-container">
          <div className="progress-bar-bg">
            <div 
              className="progress-bar-fill progress-color-yellow" 
              style={{ '--progress-height': `${Math.min(Math.max(Math.round((playerStatus.hunger / 100) * 100), 0), 100)}%` }}
            />
          </div>
          <div className="progress-bar-icon">
            <FontAwesomeIcon icon={faBurger} />
          </div>
        </div>
      </div>
      <div className="status-bar-container thirst-bar-container visible">
        <div className="progress-container">
          <div className="progress-bar-bg">
            <div 
              className="progress-bar-fill progress-color-cyan" 
              style={{ '--progress-height': `${Math.min(Math.max(Math.round((playerStatus.thirst / 100) * 100), 0), 100)}%` }}
            />
          </div>
          <div className="progress-bar-icon">
            <FontAwesomeIcon icon={faDroplet} />
          </div>
        </div>
      </div>
      <div className={`status-bar-container oxygen-bar-container ${isInWater ? 'visible' : ''}`}>
        <div className="progress-container">
          <div className="progress-bar-bg">
            <div 
              className="progress-bar-fill progress-color-oxygen" 
              style={{ '--progress-height': `${Math.min(Math.max(Math.round((playerStatus.oxygen / 100) * 100), 0), 100)}%` }}
            />
          </div>
          <div className="progress-bar-icon">
            <FontAwesomeIcon icon={faLungs} />
          </div>
        </div>
      </div>
      <TalkingIndicator
        isTalking={talkingState.isTalking}
        voiceMode={talkingState.voiceMode}
        isRadio={talkingState.isRadio}
      />
      <LocationDisplay 
        zone={locationState.zone}
        zoneName={locationState.zoneName}
        streetName={locationState.streetName}
        crossing={locationState.crossing}
        hasCrossing={locationState.hasCrossing}
        direction={locationState.direction}
        gameTime={locationState.gameTime}
      />

      <VehicleHUD vehicleData={vehicleData} />
      {isPlayerInfoVisible && (
        <PlayerInfoHUD playerData={playerData} />
      )}
      
      {isDev && (
        <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,0,0,0.5)', padding: '4px 8px', borderRadius: '3px', fontSize: '12px' }}>
          DEV
        </div>
      )}
    </div>
  ) : null;
}

function getColorClass(colors, value) {
  const percent = Math.min(Math.max(Math.round(value), 0), 100);
  const threshold = colors.find(t => percent < t.threshold);
  return threshold ? threshold.color : colors[colors.length - 1].color;
}

export default App
