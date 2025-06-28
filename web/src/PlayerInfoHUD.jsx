import React, { useState, useEffect, memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet, faBriefcase, faCoins, faPiggyBank, faBuilding } from '@fortawesome/free-solid-svg-icons';

const PlayerInfoHUD = memo(function PlayerInfoHUD({ playerData }) {
  if (!playerData) {
    return null;
  }
  
  const [visibleBars, setVisibleBars] = useState({
    bank: true,
    money: true,
    black_money: true,
    society_money: true,
  });

  const [prevValues, setPrevValues] = useState({
    bank: playerData.bank || 0,
    money: playerData.money || 0,
    black_money: playerData.black_money || 0,
    society_money: playerData.society_money || 0,
  });

  const formatCurrency = (amount) => {
    const numAmount = typeof amount === 'number' ? amount : parseInt(amount) || 0;
    return numAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' kr';
  };

  useEffect(() => {
    const updateVisibility = () => {
      const newVisibility = {
        bank: !!playerData.bank,
        money: !!playerData.money,
        black_money: !!playerData.black_money,
        society_money: !!playerData.is_boss, 
      };

      setVisibleBars(newVisibility);
      
      setPrevValues({
        bank: playerData.bank || 0,
        money: playerData.money || 0,
        black_money: playerData.black_money || 0,
        society_money: playerData.society_money || 0,
      });
    };
    
    updateVisibility();
  }, [playerData.bank, playerData.money, playerData.black_money, playerData.society_money, playerData.is_boss]);

  const isBoss = () => {
    if (playerData.is_boss === true) return true;
    if (playerData.is_boss === 'true') return true;
    if (playerData.is_boss === 1) return true;
    if (playerData.is_boss === '1') return true;
    return false;
  };

  return (
    <div className="player-info-hud">
      <div className="info-item-vertical fadeIn">
        <div className="info-icon">
          <FontAwesomeIcon icon={faBriefcase} />
        </div>
        <div className="info-value">
          {playerData.job || 'Unemployed'} 
          {playerData.jobGrade && <span className="job-grade">{playerData.jobGrade}</span>}
        </div>
      </div>
      
      {isBoss() && (
        <div className="info-item-vertical fadeIn">
          <div className="info-icon">
            <FontAwesomeIcon icon={faBuilding} />
          </div>
          <div className="info-value">{formatCurrency(playerData.society_money || 0)}</div>
        </div>
      )}
      
      {(visibleBars.bank || prevValues.bank !== 0) && (
        <div 
          className={`info-item-vertical ${!visibleBars.bank ? 'fadeOut' : 'fadeIn'}`}
          key={`bank-${visibleBars.bank}`}
        >
          <div className="info-icon">
            <FontAwesomeIcon icon={faPiggyBank} />
          </div>
          <div className="info-value">{formatCurrency(playerData.bank)}</div>
        </div>
      )}
      
      {(visibleBars.money || prevValues.money !== 0) && (
        <div 
          className={`info-item-vertical ${!visibleBars.money ? 'fadeOut' : 'fadeIn'}`}
          key={`money-${visibleBars.money}`}
        >
          <div className="info-icon">
            <FontAwesomeIcon icon={faWallet} />
          </div>
          <div className="info-value">{formatCurrency(playerData.money)}</div>
        </div>
      )}
      
      {(visibleBars.black_money || prevValues.black_money !== 0) && (
        <div 
          className={`info-item-vertical ${!visibleBars.black_money ? 'fadeOut' : 'fadeIn'}`}
          key={`black-money-${visibleBars.black_money}`}
        >
          <div className="info-icon" data-icon="coins">
            <FontAwesomeIcon icon={faCoins} />
          </div>
          <div className="info-value">{formatCurrency(playerData.black_money)}</div>
        </div>
      )}
    </div>
  );
});

export default PlayerInfoHUD; 