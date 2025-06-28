local ESX = exports['es_extended']:getSharedObject()

AddEventHandler('onResourceStart', function(resourceName)
    if (GetCurrentResourceName() ~= resourceName) then
        return
    end
end)

function GetOnlinePlayers()
    local playerCount = #GetPlayers()
    return playerCount
end

local function GetPlayerDataFromId(source)
    local xPlayer = ESX.GetPlayerFromId(source)
    if not xPlayer then return nil end
    local money = xPlayer.getMoney() or 0
    local bankAccount = xPlayer.getAccount('bank')
    local bank = bankAccount and bankAccount.money or 0
    local black_money = xPlayer.getInventoryItem('black_money').count or 0
    local job = xPlayer.job.label or 'Unemployed'
    local jobGrade = xPlayer.job.grade_label or ''
    local is_boss = (xPlayer.job.grade_name == 'boss')
    local society_money = 0
    if is_boss then
        local societyAccount = nil
        local societyName = 'society_' .. xPlayer.job.name
        TriggerEvent('esx_addonaccount:getSharedAccount', societyName, function(account)
            societyAccount = account
        end)
        Citizen.Wait(100)
        if societyAccount then
            society_money = societyAccount.money
        end
    end
    return {
        money = money,
        bank = bank,
        black_money = black_money,
        job = job,
        jobGrade = jobGrade,
        society_money = society_money,
        is_boss = is_boss
    }
end

lib.callback.register('ejj_hud:getPlayerData', function(source)
    source = tonumber(source)
    if not source or source <= 0 then
        return {}
    end
    local playerData = GetPlayerDataFromId(source)
    if not playerData then
        return {}
    end
    local playerCount = GetOnlinePlayers()
    Player(source).state:set('playerInfo', playerData, true)
    local returnData = {
        money = playerData.money,
        bank = playerData.bank,
        black_money = playerData.black_money,
        job = playerData.job,
        jobGrade = playerData.jobGrade,
        playerCount = playerCount,
        society_money = playerData.society_money or 0,
        is_boss = (playerData.is_boss == true)
    }
    return returnData
end)

function UpdatePlayerData(source)
    source = tonumber(source)
    if not source or source <= 0 then return end
    local playerData = GetPlayerDataFromId(source)
    if not playerData then return end
    Player(source).state:set('playerInfo', playerData, true)
end

AddEventHandler('esx:removeAccountMoney', function(source, accountName, money, reason)
    source = tonumber(source)
    if source and source > 0 then
        UpdatePlayerData(source)
    end
end)

AddEventHandler('esx:setAccountMoney', function(source, accountName, money, reason)
    source = tonumber(source)
    if source and source > 0 then
        UpdatePlayerData(source)
    end
end)

AddEventHandler('esx:setJob', function(source, job)
    source = tonumber(source)
    if source and source > 0 then
        UpdatePlayerData(source)
    end
end)

AddEventHandler('esx:playerLoaded', function(playerId, xPlayer, isNew)
    playerId = tonumber(playerId)
    if not playerId or playerId <= 0 then return end
    UpdatePlayerData(playerId)
end)

Citizen.CreateThread(function()
    while true do
        Citizen.Wait(10000) 
        local players = ESX.GetPlayers()
        for i=1, #players do
            local playerId = tonumber(players[i])
            if playerId and playerId > 0 then
                UpdatePlayerData(playerId)
            end
        end
        local playerCount = #players
        TriggerClientEvent('ejj_hud:updatePlayerCount', -1, playerCount)
    end
end)