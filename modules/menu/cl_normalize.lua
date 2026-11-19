SX.Normalize = {}

local TONES = { neutral = true, danger = true, safe = true, warning = true, accent = true }

local validPositions = {}
for _, position in ipairs(Config.Positions) do
    validPositions[position] = true
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

local MAX_STATS = 4

function ROW_TYPES.stats(row, normalized)
    local items = {}
    for _, item in ipairs(type(row.items) == 'table' and row.items or {}) do
        if type(item) == 'table' then
            items[#items + 1] = {
                label = item.label ~= nil and tostring(item.label) or nil,
                value = item.value ~= nil and tostring(item.value) or '',
                icon = item.icon,
                tone = normalizeTone(item.tone),
            }
            if #items >= MAX_STATS then break end
        end
    end
    normalized.items = items
end

local IMAGE_FITS = { cover = true, contain = true }

function ROW_TYPES.image(row, normalized)
    normalized.src = type(row.src) == 'string' and row.src or ''
    normalized.height = math.floor(Utils.Clamp(toNumber(row.height, 120), 40, 320))
    normalized.fit = IMAGE_FITS[row.fit] and row.fit or 'cover'
end

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

SX.Normalize.Number = toNumber
SX.Normalize.Tone = normalizeTone
SX.Normalize.ThresholdTone = thresholdTone
SX.Normalize.Row = normalizeRow
SX.Normalize.Menu = normalizeMenu
