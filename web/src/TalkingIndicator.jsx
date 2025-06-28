import React, { memo, useMemo, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faVolumeOff, 
  faVolumeLow, 
  faVolumeHigh,
  faWalkieTalkie
} from '@fortawesome/free-solid-svg-icons';

const TalkingIndicator = memo(function TalkingIndicator({ isTalking, voiceMode, isRadio = false }) {
  useEffect(() => {
  }, [isTalking, voiceMode, isRadio]);

  const voiceIcon = useMemo(() => {
    if (isRadio) return faWalkieTalkie;
    
    switch(voiceMode) {
      case 1: return faVolumeOff; 
      case 2: return faVolumeLow;  
      case 3: return faVolumeHigh;
      default: return faVolumeLow; 
    }
  }, [voiceMode, isRadio]);
  
  const voiceModeText = useMemo(() => {
    if (isRadio) return "Radio";
    
    switch(voiceMode) {
      case 1: return "Whisper";
      case 2: return "Normal";  
      case 3: return "Shout";
      default: return "Normal";
    }
  }, [voiceMode, isRadio]);
  
  const voiceModeClass = useMemo(() => {
    if (isRadio) return "voice-radio";
    
    switch(voiceMode) {
      case 1: return "voice-whisper";
      case 2: return "voice-normal";
      case 3: return "voice-shout";
      default: return "voice-normal";
    }
  }, [voiceMode, isRadio]);
  
  const className = useMemo(() => {
    const talkingClass = isTalking ? 'voice-talking' : '';
    const radioClass = isRadio ? 'voice-radio' : '';
    return `voice-indicator status-bar-container ${voiceModeClass} ${talkingClass} ${radioClass}`;
  }, [voiceModeClass, isTalking, isRadio]);
  
  return (
    <div className={className}>
      <div className="progress-container">
        <div className="progress-bar-bg">
          <div 
            className={`progress-bar-fill ${isTalking ? 'voice-active' : 'voice-inactive'}`} 
            style={{ width: "100%" }}
          />
        </div>
        <div className="progress-bar-icon">
          <FontAwesomeIcon icon={voiceIcon} />
        </div>
      </div>
    </div>
  );
});

export default TalkingIndicator; 