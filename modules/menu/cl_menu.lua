SX.Menu = {}
SX.Modules:Register("Menu", 10)

local menus = {}
local focused = nil
local counter = 0

local TONES = { neutral = true, danger = true, safe = true, warning = true, accent = true }

local validPositions = {}
for _, position in ipairs(Config.Positions) do
    validPositions[position] = true
end

local function pageCount(entry)
    return #entry.data.pages
end

local function normalizeTone(tone)
    if type(tone) ~= 'string' then return nil end
    if TONES[tone] or tone:match('^#%x%x%x%x?%x?%x?%x?%x?$') then return tone end
    return nil
end

local function toNumber(value, default)
    value = tonumber(value)
    if value == nil or value ~= value then return default end
    return value
end

local ROW_TYPES = {}

local function thresholdTone(thresholds, value)
    if type(thresholds) ~= 'table' then return nil end

    local best = nil
    for _, threshold in ipairs(thresholds) do
        local limit = type(threshold) == 'table' and toNumber(threshold.value, nil) or nil
        local tone = limit and normalizeTone(threshold.tone)
        if tone and value <= limit and (not best or limit < best.limit) then
            best = { limit = limit, tone = tone }
        end
    end

    return best and best.tone or nil
end

local function normalizeLevel(row, normalized)
    local max = toNumber(row.max, 1.0)
    if max <= 0 then max = 1.0 end
    local value = toNumber(row.value, 0.0)

    normalized.tone = thresholdTone(row.thresholds, value) or normalized.tone

    normalized.value = Utils.Clamp(value / max, 0.0, 1.0)
    if row.display ~= nil then
        normalized.display = tostring(row.display)
    elseif max ~= 1.0 then
        normalized.display = tostring(Utils.Round(value, 1))
    end
end

function ROW_TYPES.text(row, normalized)
    normalized.value = row.value ~= nil and tostring(row.value) or ''
end

function ROW_TYPES.bar(row, normalized)
    normalizeLevel(row, normalized)
    normalized.segments = math.floor(Utils.Clamp(toNumber(row.segments, 10), 2, 30))
end

ROW_TYPES.slider = normalizeLevel

local MAX_KEYS = 6

function ROW_TYPES.keys(row, normalized)
    local keys = {}
    for _, item in ipairs(type(row.keys) == 'table' and row.keys or {}) do
        if type(item) == 'table' and item.key ~= nil then
            keys[#keys + 1] = {
                key = tostring(item.key),
                label = item.label ~= nil and tostring(item.label) or nil,
            }
            if #keys >= MAX_KEYS then break end
        end
    end
    normalized.keys = keys
end

function ROW_TYPES.countdown(row, normalized)
    local endsAt = toNumber(row.endsAt, nil)
    if not endsAt then
        endsAt = GetGameTimer() + math.max(toNumber(row.value, 0), 0) * 1000
        row.endsAt = endsAt
    end

    normalized.remaining = math.max(0, endsAt - GetGameTimer())
    normalized.done = row.done ~= nil and tostring(row.done) or nil
    normalized.doneTone = normalizeTone(row.doneTone)
end

local function normalizeRow(row)
    if type(row) ~= 'table' then return nil end

    local kind = row.type or 'text'
    local normalizer = ROW_TYPES[kind]
    if not normalizer then
        Logger:warn('Menu', ('Unknown row type "%s"'):format(tostring(kind)))
        return nil
    end

    local normalized = {
        id = row.id ~= nil and tostring(row.id) or nil,
        type = kind,
        label = tostring(row.label or ''),
        icon = row.icon,
        tone = normalizeTone(row.tone),
        scramble = row.scramble ~= false,
    }

    normalizer(row, normalized)
    return normalized
end

local function normalizeFooter(footer)
    if type(footer) ~= 'table' then return nil end

    local items = {}
    for _, item in ipairs(footer.items or {}) do
        if type(item) == 'table' then
            items[#items + 1] = {
                value = item.value ~= nil and tostring(item.value) or '',
                icon = item.icon,
                tone = normalizeTone(item.tone),
            }
        elseif item ~= nil then
            items[#items + 1] = { value = tostring(item) }
        end
    end

    return {
        label = footer.label ~= nil and tostring(footer.label) or nil,
        items = items,
    }
end

local function normalizeHeader(header)
    if type(header) ~= 'table' then return nil end
    if header.title == nil and header.subtitle == nil then return nil end

    return {
        title = header.title ~= nil and tostring(header.title) or nil,
        subtitle = header.subtitle ~= nil and tostring(header.subtitle) or nil,
        image = type(header.image) == 'string' and header.image or nil,
        watermark = header.watermark ~= nil and tostring(header.watermark) or nil,
    }
end

local function normalizePage(page, index)
    if type(page) ~= 'table' then return nil end

    local rows = {}
    for _, row in ipairs(page.rows or {}) do
        rows[#rows + 1] = normalizeRow(row)
    end

    return {
        id = page.id ~= nil and tostring(page.id) or ('page_%d'):format(index),
        title = page.title ~= nil and tostring(page.title) or nil,
        icon = page.icon,
        header = normalizeHeader(page.header),
        rows = rows,
        footer = normalizeFooter(page.footer),
    }
end

local function normalizeOffset(offset)
    local defaults = Config.Defaults.offset
    if type(offset) ~= 'table' then
        return { x = defaults.x, y = defaults.y }
    end
    return {
        x = toNumber(offset.x, defaults.x),
        y = toNumber(offset.y, defaults.y),
    }
end

local function normalizeMenu(menu)
    local position = menu.position or Config.Defaults.position
    if not validPositions[position] then
        Logger:warn('Menu', ('Unknown position "%s", using "%s"'):format(tostring(position), Config.Defaults.position))
        position = Config.Defaults.position
    end

    local pages = {}
    local source = menu.pages
    if type(source) ~= 'table' or #source == 0 then
        source = { { title = menu.title, icon = menu.icon, rows = menu.rows, footer = menu.footer } }
    end
    for index, page in ipairs(source) do
        pages[#pages + 1] = normalizePage(page, index)
    end

    local key = menu.key
    if key == nil or key == true then
        key = true
    elseif key ~= false then
        key = tostring(key)
    end

    local glass = Config.Defaults.glass
    if menu.glass ~= nil then glass = menu.glass == true end

    return {
        id = menu.id,
        position = position,
        offset = normalizeOffset(menu.offset),
        width = toNumber(menu.width, Config.Defaults.width),
        scale = toNumber(menu.scale, Config.Defaults.scale),
        header = normalizeHeader(menu.header),
        pages = pages,
        key = key ~= false and key or nil,
        glass = glass,
    }
end

local function send(entry)
    local data = entry.data
    SX.UI:Send('setMenu', {
        id = data.id,
        position = data.position,
        offset = data.offset,
        width = data.width,
        scale = data.scale,
        header = data.header,
        pages = data.pages,
        key = data.key,
        page = entry.page,
        order = entry.order,
        glass = data.glass,
    })
end

local KEY_COMMAND = 'helpmenu_nextpage'
local KEY_REFRESH = 1000

local focusWatching = false
local keyLabel = nil

local function resolveKeyLabel()
    if tonumber(Config.Keys.control) then
        return tostring(Config.Keys.nextPage)
    end

    local button = GetControlInstructionalButton(0, GetHashKey(KEY_COMMAND) | 0x80000000, true)
    if type(button) == 'string' and button:sub(1, 2) == 't_' and #button > 2 then
        return button:sub(3)
    end

    return tostring(Config.Keys.nextPage)
end

local function updateKeyLabel()
    local label = resolveKeyLabel()
    if label == keyLabel then return end
    keyLabel = label
    SX.UI:Send('setKeyLabel', { label = label })
end

local function watchFocus()
    if focusWatching then return end
    focusWatching = true
    local control = tonumber(Config.Keys.control)

    CreateThread(function()
        while focused do
            if control then
                DisableControlAction(0, control, true)
                if IsDisabledControlJustPressed(0, control) then
                    SX.Menu:SetPage(focused, 'next')
                end
                Wait(0)
            else
                updateKeyLabel()
                Wait(KEY_REFRESH)
            end
        end
        focusWatching = false
    end)
end

local function refreshFocus()
    local best = nil
    for id, entry in pairs(menus) do
        if entry.data.key and pageCount(entry) > 1 and (not best or entry.shownAt > menus[best].shownAt) then
            best = id
        end
    end

    if best ~= focused then
        focused = best
        SX.UI:Send('setFocus', { id = focused })
    end

    if focused then
        updateKeyLabel()
        watchFocus()
    end
end

local function armTimer(entry, duration)
    entry.timer = (entry.timer or 0) + 1
    duration = tonumber(duration)
    if not duration or duration <= 0 then return end

    local token = entry.timer
    local id = entry.data.id
    SetTimeout(duration, function()
        local current = menus[id]
        if current and current.timer == token then
            SX.Menu:Hide(id)
        end
    end)
end

local function sameStack(a, b)
    return a.position == b.position and a.offset.x == b.offset.x and a.offset.y == b.offset.y
end

local function enforceLimit(id)
    local limit = tonumber(Config.StackLimit) or 0
    local entry = menus[id]
    if limit <= 0 or not entry then return end

    local others = {}
    for otherId, other in pairs(menus) do
        if otherId ~= id and sameStack(other.data, entry.data) then
            others[#others + 1] = otherId
        end
    end

    if #others < limit then return end
    table.sort(others, function(a, b) return menus[a].shownAt < menus[b].shownAt end)

    for i = 1, #others - limit + 1 do
        SX.Menu:Hide(others[i])
    end
end

local hiders = {}
local hidden = false
local hideWatching = false

local function shouldHide()
    if next(hiders) then return true end

    local rules = Config.Hide
    if rules.pauseMenu and IsPauseMenuActive() then return true end
    if rules.hudHidden and IsHudHidden() then return true end
    if rules.screenFaded and (IsScreenFadedOut() or IsScreenFadingOut()) then return true end
    if rules.cinematic and IsCinematicCamRendering() then return true end

    return false
end

local function applyHidden()
    local value = shouldHide()
    if value == hidden then return end
    hidden = value
    SX.UI:Send('setHidden', { hidden = value })
    TriggerEvent('sxHelpMenu:hiddenChanged', value)
end

local function watchHidden()
    if hideWatching then return end
    hideWatching = true

    CreateThread(function()
        while next(menus) do
            applyHidden()
            Wait(Config.Hide.interval)
        end
        hideWatching = false
    end)
end

function SX.Menu:SetHidden(resource, value)
    hiders[resource or 'unknown'] = value and true or nil
    applyHidden()
end

function SX.Menu:IsHidden()
    return hidden
end

function SX.Menu:Show(menu, resource)
    if type(menu) ~= 'table' then
        Logger:error('Menu', 'Show expects a table')
        return nil
    end

    if menu.id == nil then
        counter = counter + 1
        menu.id = ('menu_%d'):format(counter)
    end
    menu.id = tostring(menu.id)

    local entry = menus[menu.id]
    local data = normalizeMenu(menu)

    if entry then
        entry.data = data
        entry.raw = menu
        entry.page = math.min(entry.page, #data.pages - 1)
        if menu.page ~= nil then
            entry.page = math.floor(Utils.Clamp(toNumber(menu.page, 0), 0, #data.pages - 1))
        end
    else
        counter = counter + 1
        entry = {
            data = data,
            raw = menu,
            resource = resource,
            page = math.floor(Utils.Clamp(toNumber(menu.page, 0), 0, #data.pages - 1)),
            order = toNumber(menu.order, counter),
        }
        menus[menu.id] = entry
    end

    entry.shownAt = GetGameTimer()
    entry.tickAt = nil
    if resource then entry.resource = resource end

    send(entry)
    enforceLimit(menu.id)
    armTimer(entry, menu.duration)
    refreshFocus()
    watchHidden()

    return menu.id
end

function SX.Menu:Update(id, patch)
    local entry = menus[tostring(id)]
    if not entry or type(patch) ~= 'table' then return false end

    local raw = entry.raw
    for k, v in pairs(patch) do
        raw[k] = v
    end

    entry.data = normalizeMenu(raw)
    entry.page = math.min(entry.page, #entry.data.pages - 1)
    send(entry)
    enforceLimit(entry.data.id)
    if patch.duration ~= nil then
        armTimer(entry, patch.duration)
    end
    refreshFocus()
    return true
end

local function findRows(raw, rowId)
    local found = {}
    local pages = raw.pages
    if type(pages) ~= 'table' or #pages == 0 then
        pages = { raw }
    end

    for _, page in ipairs(pages) do
        for _, row in ipairs(page.rows or {}) do
            if row.id ~= nil and tostring(row.id) == rowId then
                found[#found + 1] = row
            end
        end
    end

    return found
end

function SX.Menu:UpdateRow(id, rowId, patch)
    local entry = menus[tostring(id)]
    if not entry or type(patch) ~= 'table' then return false end

    local rows = findRows(entry.raw, tostring(rowId))
    if #rows == 0 then return false end

    for _, row in ipairs(rows) do
        for k, v in pairs(patch) do
            row[k] = v
        end
    end

    entry.data = normalizeMenu(entry.raw)
    send(entry)
    return true
end

local watching = false

local function watchTicks()
    if watching then return end
    watching = true

    CreateThread(function()
        while true do
            local now = GetGameTimer()
            local active = false

            for id, entry in pairs(menus) do
                if entry.tickAt then
                    if now - entry.tickAt > Config.TickTimeout then
                        SX.Menu:Hide(id)
                    else
                        active = true
                    end
                end
            end

            if not active then break end
            Wait(0)
        end

        watching = false
    end)
end

function SX.Menu:ShowThisFrame(menu, resource)
    local id = type(menu) == 'table' and menu.id or menu
    if id == nil then
        Logger:error('Menu', 'ShowThisFrame needs a menu with an id')
        return nil
    end
    id = tostring(id)

    local entry = menus[id]
    if not entry then
        if type(menu) ~= 'table' then return nil end
        self:Show(menu, resource)
        entry = menus[id]
        if not entry then return nil end
    end

    entry.tickAt = GetGameTimer()
    watchTicks()
    return id
end

function SX.Menu:Hide(id)
    id = tostring(id)
    local entry = menus[id]
    if not entry then return false end

    entry.timer = (entry.timer or 0) + 1
    menus[id] = nil
    SX.UI:Send('removeMenu', { id = id })
    refreshFocus()
    return true
end

function SX.Menu:HideAll(resource)
    for id, entry in pairs(menus) do
        if not resource or entry.resource == resource then
            self:Hide(id)
        end
    end
end

function SX.Menu:SetPage(id, page)
    id = tostring(id or focused)
    local entry = menus[id]
    if not entry then return false end

    local count = pageCount(entry)
    local current = entry.page
    local target, direction

    if page == 'next' then
        target, direction = (current + 1) % count, 1
    elseif page == 'prev' then
        target, direction = (current - 1 + count) % count, -1
    else
        target = math.floor(Utils.Clamp(toNumber(page, 0), 0, count - 1))
        direction = target >= current and 1 or -1
    end

    if target == current then return true end

    entry.page = target
    SX.UI:Send('setPage', { id = id, page = target, direction = direction })
    TriggerEvent('sxHelpMenu:pageChanged', id, target)
    return true
end

function SX.Menu:GetPage(id)
    local entry = menus[tostring(id)]
    return entry and entry.page or nil
end

function SX.Menu:IsVisible(id)
    return menus[tostring(id)] ~= nil
end

function SX.Menu:GetFocused()
    return focused
end

function SX.Menu:Initialize()
    if not tonumber(Config.Keys.control) then
        RegisterCommand(KEY_COMMAND, function()
            if focused then
                SX.Menu:SetPage(focused, 'next')
            end
        end, false)
        RegisterKeyMapping(KEY_COMMAND, GetPhrase('keymap_next_page'), 'keyboard', Config.Keys.nextPage)
    end

    AddEventHandler('onResourceStop', function(resource)
        if resource == GetCurrentResourceName() then return end
        SX.Menu:HideAll(resource)
        if hiders[resource] then
            SX.Menu:SetHidden(resource, false)
        end
    end)
end
