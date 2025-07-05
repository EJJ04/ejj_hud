local ESX = exports["es_extended"]:getSharedObject()

local uiVisible = false

local playerInfoVisible = true

local playerStatus = {
    health = 100,
    armor = 0,
    hunger = 100,
    thirst = 100
}

local playerData = {
    money = 0,
    bank = 0,
    black_money = 0,
    job = 'Unemployed',
    jobGrade = '',
    playerId = GetPlayerServerId(PlayerId()),
    playerCount = 0,
    society_money = 0,
    is_boss = false
}

local locationUpdateInterval = 1000 
local playerLocation = {
    zone = "",
    zoneName = "",
    streetName = "",
    crossing = "",
    hasCrossing = false
}

local function UpdateUI()
    local dataToSend = {
        money = playerData.money or 0,
        bank = playerData.bank or 0,
        black_money = playerData.black_money or 0,
        job = playerData.job or 'Unemployed',
        jobGrade = playerData.jobGrade or '',
        playerId = playerData.playerId or GetPlayerServerId(PlayerId()),
        playerCount = playerData.playerCount or 0,
        society_money = playerData.society_money or 0,
        is_boss = playerData.is_boss or false
    }
    
    SendNUIMessage({
        action = 'updatePlayerInfo',
        playerData = dataToSend
    })
end

AddStateBagChangeHandler('playerInfo', nil, function(bagName, key, value, _unused, replicated)
    local playerId = GetPlayerServerId(PlayerId())
    local targetPlayer = nil
    if type(bagName) == 'string' then
        local idStr = bagName:match('player:(%d+)')
        if idStr then
            targetPlayer = tonumber(idStr)
        end
    end
    if targetPlayer == playerId and value and type(value) == 'table' then
        if not ComparePlayerData(playerData, value) then
            playerData.money = value.money or 0
            playerData.bank = value.bank or 0
            playerData.black_money = value.black_money or 0
            playerData.job = value.job or 'Unemployed'
            playerData.jobGrade = value.jobGrade or ''
            playerData.society_money = value.society_money or 0
            playerData.is_boss = value.is_boss or false
            playerData.playerId = playerId
            UpdateUI()
        end
    end
end)

RegisterNetEvent('ejj_hud:updatePlayerCount', function(count)
    if count ~= nil and playerData.playerCount ~= count then
        playerData.playerCount = count
        UpdateUI()
    end
end)

RegisterNetEvent('esx:playerLoaded')
AddEventHandler('esx:playerLoaded', function(xPlayer, isNew, skin)
    playerData.playerId = GetPlayerServerId(PlayerId())
    local result = lib.callback.await('ejj_hud:getPlayerData', false)
    if result then
        playerData.money = result.money or 0
        playerData.bank = result.bank or 0
        playerData.black_money = result.black_money or 0
        playerData.job = result.job or 'Unemployed'
        playerData.jobGrade = result.jobGrade or ''
        playerData.playerCount = result.playerCount or 0
        playerData.society_money = result.society_money or 0
        playerData.is_boss = result.is_boss or false
        UpdateUI()
        SendNUIMessage({
            action = 'toggleHud',
            visible = true
        })
        uiVisible = true
        TriggerEvent('ejj_hud:client:LoadMap')
        Citizen.SetTimeout(2000, function()
            if not uiVisible then
                SendNUIMessage({
                    action = 'toggleHud',
                    visible = true
                })
                uiVisible = true
            end
        end)
    end
end)

function ComparePlayerData(oldData, newData)
    if not oldData or not newData then return false end
    if oldData.money ~= (newData.money or 0) then return false end
    if oldData.bank ~= (newData.bank or 0) then return false end
    if oldData.black_money ~= (newData.black_money or 0) then return false end
    if oldData.job ~= (newData.job or 'Unemployed') then return false end
    if oldData.jobGrade ~= (newData.jobGrade or '') then return false end
    if oldData.society_money ~= (newData.society_money or 0) then return false end
    if oldData.is_boss ~= (newData.is_boss or false) then return false end
    return true
end

function RefreshPlayerData()
    local success, result = pcall(function()
        return lib.callback.await('ejj_hud:getPlayerData', false)
    end)
    if success and result then
        playerData.money = result.money or 0
        playerData.bank = result.bank or 0
        playerData.black_money = result.black_money or 0
        playerData.job = result.job or 'Unemployed'
        playerData.jobGrade = result.jobGrade or ''
        playerData.playerCount = result.playerCount or 0
        playerData.society_money = result.society_money or 0
        playerData.is_boss = result.is_boss or false
        UpdateUI()
        return true
    end
    return false
end

local function UpdatePlayerLocation()
    local playerPed = cache.ped
    local coords = GetEntityCoords(playerPed)
    local zoneHash = GetNameOfZone(coords.x, coords.y, coords.z)
    local zoneName = GetLabelText(zoneHash)
    local streetHash, crossingHash = GetStreetNameAtCoord(coords.x, coords.y, coords.z)
    local streetName = GetStreetNameFromHashKey(streetHash)
    local crossing = ""
    local hasCrossing = false
    if crossingHash ~= 0 then
        crossing = GetStreetNameFromHashKey(crossingHash)
        hasCrossing = true
    end
    local heading = 360.0 - GetEntityHeading(playerPed)
    if heading == 360 then heading = 0 end
    local direction = ""
    if heading >= 337.5 or heading < 22.5 then
        direction = "N"
    elseif heading >= 22.5 and heading < 67.5 then
        direction = "NØ"
    elseif heading >= 67.5 and heading < 112.5 then
        direction = "Ø"
    elseif heading >= 112.5 and heading < 157.5 then
        direction = "SØ"
    elseif heading >= 157.5 and heading < 202.5 then
        direction = "S"
    elseif heading >= 202.5 and heading < 247.5 then
        direction = "SV"
    elseif heading >= 247.5 and heading < 292.5 then
        direction = "V"
    elseif heading >= 292.5 and heading < 337.5 then
        direction = "NV"
    end            
    local hours = GetClockHours()
    local minutes = GetClockMinutes()
    local gameTime = string.format("%02d:%02d", hours, minutes)
    if playerLocation.zone ~= zoneHash or
       playerLocation.streetName ~= streetName or
       playerLocation.crossing ~= crossing or
       playerLocation.direction ~= direction or
       playerLocation.gameTime ~= gameTime then
        playerLocation = {
            zone = zoneHash,
            zoneName = zoneName,
            streetName = streetName,
            crossing = crossing,
            hasCrossing = hasCrossing,
            direction = direction,
            gameTime = gameTime
        }
        SendNUIMessage({
            action = 'updateLocation',
            location = playerLocation
        })
    end
end

Citizen.CreateThread(function()
    while true do
        Citizen.Wait(locationUpdateInterval)
        UpdatePlayerLocation()
    end
end)

RegisterCommand('toggleinfo', function()
    playerInfoVisible = not playerInfoVisible
    SendNUIMessage({
        action = 'togglePlayerInfo',
        visible = playerInfoVisible
    })
end, false)

RegisterKeyMapping('toggleinfo', 'Toggle Player Info Display', 'keyboard', 'F9')

RegisterNetEvent('ejj_hud:client:LoadMap', function()
    Wait(50)

    local aspectRatio = GetAspectRatio(false)
    local resolutionX, resolutionY = GetActiveScreenResolution()
    local minimapOffset = 0

    if aspectRatio > (1920 / 1080) then
        minimapOffset = ((1920 / 1080 - aspectRatio) / 3.6) - 0.008
    end

    local textureLoaded = false
    for i = 1, 3 do
        local timeout = i * 1000
        textureLoaded = lib.requestStreamedTextureDict('squaremap', timeout)
        if textureLoaded then break end
        textureLoaded = lib.requestStreamedTextureDict('minimap', timeout)
        if textureLoaded then break end
        Wait(250)
    end

    local textureDict = HasStreamedTextureDictLoaded('squaremap') and 'squaremap' or 'minimap'

    SetMinimapClipType(0)
    AddReplaceTexture('platform:/textures/graphics', 'radarmasksm', textureDict, 'radarmasksm')
    AddReplaceTexture('platform:/textures/graphics', 'radarmask1g', textureDict, 'radarmasksm')

    local baseX = 0.0 + minimapOffset
    SetMinimapComponentPosition('minimap', 'L', 'B', baseX, -0.047, 0.1638, 0.183)  
    SetMinimapComponentPosition('minimap_mask', 'L', 'B', baseX, 0.0, 0.128, 0.20)   
    SetMinimapComponentPosition('minimap_blur', 'L', 'B', baseX - 0.01, 0.025, 0.262, 0.300) 

    SetBlipAlpha(GetNorthRadarBlip(), 0)
    SetBigmapActive(true, false)
    SetMinimapClipType(0)
    Wait(50)
    SetBigmapActive(false, false)

    if HasStreamedTextureDictLoaded('squaremap') then
        SetStreamedTextureDictAsNoLongerNeeded('squaremap')
    end
    if HasStreamedTextureDictLoaded('minimap') then
        SetStreamedTextureDictAsNoLongerNeeded('minimap')
    end

    Wait(1200)
end)
