local speak = false

Citizen.CreateThread(function()
    while true do
        Citizen.Wait(250)
        
        local status = NetworkIsPlayerTalking(PlayerId())
        if status ~= speak then
            speak = status
            SendNUIMessage({action = 'speak', active = status})
        end
    end
end)

RegisterNetEvent('pma-voice:setTalkingMode')
AddEventHandler('pma-voice:setTalkingMode', function(lvl)
    if lvl and tonumber(lvl) and tonumber(lvl) >= 1 and tonumber(lvl) <= 3 then
        SendNUIMessage({action = 'voice', lvl = tostring(lvl)})
    end
end)

RegisterNetEvent('pma-voice:radioActive')
AddEventHandler('pma-voice:radioActive', function(radioTalking)
    if type(radioTalking) == 'boolean' then
        SendNUIMessage({action = 'radio', active = radioTalking})
    end
end)