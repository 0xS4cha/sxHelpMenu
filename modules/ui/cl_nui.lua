SX.UI = {}
SX.Modules:Register("UI", 5)

local ready = false
local queue = {}

function SX.UI:Send(action, data)
    local message = { action = action, data = data or {} }

    if not ready then
        queue[#queue + 1] = message
        return
    end

    SendNUIMessage(message)
end

function SX.UI:IsReady()
    return ready
end

function SX.UI:Initialize()
    RegisterNUICallback('nuiReady', function(_, cb)
        ready = true
        SendNUIMessage({ action = 'setSettings', data = { gap = Config.Defaults.gap, glass = Config.Glass, key = tostring(Config.Keys.nextPage) } })
        for _, message in ipairs(queue) do
            SendNUIMessage(message)
        end
        queue = {}
        TriggerEvent('sxHelpMenu:ready')
        cb({ ok = true })
    end)
end
