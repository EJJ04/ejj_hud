local display = true
local ESX = exports["es_extended"]:getSharedObject()

function ToggleHud(state)
    display = state
    SetNuiFocus(false, false)
    SendNUIMessage({
        type = "toggleHud",
        display = display
    })
end

RegisterCommand(Config.CommandName, function()
    ToggleHud(not display)
end, false)

function GetPlayerStatus()
    local playerPed = cache.ped
    local maxHealth = GetEntityMaxHealth(playerPed)
    local currentHealth = GetEntityHealth(playerPed)
    if currentHealth > maxHealth then maxHealth = currentHealth end
    local healthPercent = 0
    if currentHealth > 0 and maxHealth > 0 then
        healthPercent = ((currentHealth - 100) / (maxHealth - 100)) * 100
    end
    if healthPercent < 0 then healthPercent = 0 end
    if healthPercent > 100 then healthPercent = 100 end
    local armor = GetPedArmour(playerPed)
    local hunger = 100
    local thirst = 100
    if ESX and DoesEntityExist(playerPed) then
        local hungerStatus, thirstStatus = nil, nil
        local statusReady = false
        local statusCount = 0
        TriggerEvent('esx_status:getStatus', 'hunger', function(h)
            hungerStatus = h
            statusCount = statusCount + 1
            if statusCount >= 2 then statusReady = true end
        end)
        TriggerEvent('esx_status:getStatus', 'thirst', function(t)
            thirstStatus = t
            statusCount = statusCount + 1
            if statusCount >= 2 then statusReady = true end
        end)
        local startTime = GetGameTimer()
        while not statusReady and GetGameTimer() - startTime < 50 do
            Wait(100)
        end
        if hungerStatus then
            if hungerStatus.getPercent then
                hunger = hungerStatus.getPercent()
            elseif hungerStatus.val and hungerStatus.max then
                hunger = math.floor((hungerStatus.val / hungerStatus.max) * 100)
            end
        end
        if thirstStatus then
            if thirstStatus.getPercent then
                thirst = thirstStatus.getPercent()
            elseif thirstStatus.val and thirstStatus.max then
                thirst = math.floor((thirstStatus.val / thirstStatus.max) * 100)
            end
        end
    end
    hunger = math.max(0, math.min(100, hunger))
    thirst = math.max(0, math.min(100, thirst))
    local isSwimmingUnderwater = IsPedSwimmingUnderWater(playerPed)
    local oxygen = 100
    if isSwimmingUnderwater then
        oxygen = GetPlayerUnderwaterTimeRemaining(PlayerId()) * 10
        oxygen = math.min(100, math.max(0, oxygen))
    end
    return {
        health = healthPercent,
        armor = armor,
        hunger = hunger,
        thirst = thirst,
        oxygen = oxygen,
        isInWater = isSwimmingUnderwater
    }
end

function GetVehicleData()
    local playerPed = cache.ped
    local vehicle = GetVehiclePedIsIn(playerPed, false)
    local isInVehicle = IsPedInAnyVehicle(playerPed, false) and vehicle > 0
    if not isInVehicle then
        return {
            isInVehicle = false,
            speed = 0,
            fuel = 0,
            rpm = 0,
            gear = 0,
            engineHealth = 0
        }
    end
    local speed = math.floor(GetEntitySpeed(vehicle) * 3.6)
    local fuel = 0
    if GetVehicleFuelLevel ~= nil then
        fuel = Entity(vehicle).state.fuel
    end
    local rpm = math.floor(GetVehicleCurrentRpm(vehicle) * 100)
    local gear = GetVehicleCurrentGear(vehicle)
    local engineHealth = math.floor((GetVehicleEngineHealth(vehicle) / 1000) * 100)
    return {
        isInVehicle = true,
        speed = speed,
        fuel = fuel,
        rpm = rpm,
        gear = gear,
        engineHealth = engineHealth
    }
end

CreateThread(function()
    Wait(500)
    SendNUIMessage({
        type = "setConfig",
        config = Config.UISettings
    })
    ToggleHud(Config.EnableByDefault)
    local lastWaterState = false
    local lastOxygenLevel = 100
    local normalRefreshRate = Config.Display.RefreshRate
    local underwaterRefreshRate = 100
    while true do
        if display then
            local playerStatus = GetPlayerStatus()
            local currentRefreshRate = normalRefreshRate
            if playerStatus.isInWater ~= lastWaterState then
                SendNUIMessage({
                    action = "updateOxygenVisibility",
                    isVisible = playerStatus.isInWater
                })
                lastWaterState = playerStatus.isInWater
            end
            if playerStatus.isInWater or (lastOxygenLevel < 100 and playerStatus.oxygen > lastOxygenLevel) then
                currentRefreshRate = underwaterRefreshRate
            end
            lastOxygenLevel = playerStatus.oxygen
            SendNUIMessage({
                action = "updatePlayerStatus",
                status = playerStatus
            })
            Wait(currentRefreshRate)
        else
            Wait(normalRefreshRate)
        end
    end
end)

local inVehicle = false
local currentVehicle = nil
local vehicleUpdateInterval = 100

CreateThread(function()
    while true do
        if inVehicle and display and currentVehicle then
            local vehicleData = GetVehicleData()
            if vehicleData and vehicleData.isInVehicle then
                SendNUIMessage({
                    action = "updateVehicleHud",
                    vehicleData = vehicleData
                })
                Wait(vehicleUpdateInterval)
            else
                inVehicle = false
                currentVehicle = nil
                SendNUIMessage({
                    action = "updateVehicleHud",
                    vehicleData = { isInVehicle = false }
                })
                Wait(1000)
            end
        else
            Wait(1000)
        end
    end
end)

AddEventHandler('esx:enteredVehicle', function(vehicle, plate, seat, displayName, netId)
    inVehicle = true
    currentVehicle = vehicle
    local vehicleData = GetVehicleData()
    if vehicleData and vehicleData.isInVehicle then
        SendNUIMessage({
            action = "updateVehicleHud",
            vehicleData = vehicleData
        })
    end
end)

AddEventHandler('esx:exitedVehicle', function(vehicle, plate, seat, displayName, netId)
    inVehicle = false
    currentVehicle = nil
    SendNUIMessage({
        action = "updateVehicleHud",
        vehicleData = { isInVehicle = false }
    })
end)

RegisterNUICallback('hideHud', function(data, cb)
    display = false
    cb('ok')
end)

exports('ToggleHud', ToggleHud)