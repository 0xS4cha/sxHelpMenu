SX = {}
Logger = {}
function Logger:warn() end
function Logger:error() end

local now = 1000
function GetGameTimer() return now end

dofile('core/sh_utils.lua')
dofile('shared/config.lua')
dofile('modules/menu/cl_normalize.lua')

local N = SX.Normalize
local passed, failed = 0, 0

local function test(name, fn)
    local ok, err = pcall(fn)
    if ok then
        passed = passed + 1
    else
        failed = failed + 1
        print(('FAIL %s\n  %s'):format(name, err))
    end
end

local function eq(actual, expected, label)
    if actual ~= expected then
        error(('%s: expected %s, got %s'):format(label or 'value', tostring(expected), tostring(actual)), 2)
    end
end

local function menu(rows, extra)
    local data = { id = 'test', pages = { { title = 'Page', rows = rows } } }
    for k, v in pairs(extra or {}) do data[k] = v end
    return data
end

local function firstRow(row)
    return N.Menu(menu({ row })).pages[1].rows[1]
end

test('menu defaults', function()
    local result = N.Menu(menu({}))
    eq(result.position, Config.Defaults.position, 'position')
    eq(result.offset.x, Config.Defaults.offset.x, 'offset.x')
    eq(result.offset.y, Config.Defaults.offset.y, 'offset.y')
    eq(result.width, Config.Defaults.width, 'width')
    eq(result.scale, Config.Defaults.scale, 'scale')
    eq(result.glass, Config.Defaults.glass, 'glass')
    eq(result.key, true, 'key')
end)

test('unknown position falls back to the default', function()
    eq(N.Menu(menu({}, { position = 'middle' })).position, Config.Defaults.position)
end)

test('every anchor is accepted', function()
    for _, position in ipairs(Config.Positions) do
        eq(N.Menu(menu({}, { position = position })).position, position, position)
    end
end)

test('a menu without pages becomes a single page', function()
    local result = N.Menu({ id = 'single', title = 'Title', rows = { { label = 'A', value = 'B' } } })
    eq(#result.pages, 1, 'pages')
    eq(result.pages[1].title, 'Title', 'title')
    eq(result.pages[1].rows[1].value, 'B', 'row')
end)

test('pages get an id from their index', function()
    eq(N.Menu(menu({})).pages[1].id, 'page_1')
end)

test('key false, string and true', function()
    eq(N.Menu(menu({}, { key = false })).key, nil, 'false')
    eq(N.Menu(menu({}, { key = 'E' })).key, 'E', 'string')
    eq(N.Menu(menu({}, { key = true })).key, true, 'true')
end)

test('glass can be turned off per menu', function()
    eq(N.Menu(menu({}, { glass = false })).glass, false)
end)

test('header needs a title or a subtitle', function()
    eq(N.Menu(menu({}, { header = { image = 'x.png' } })).header, nil, 'empty')
    eq(N.Menu(menu({}, { header = { title = 'T20' } })).header.title, 'T20', 'title')
end)

test('tones', function()
    eq(N.Tone('danger'), 'danger', 'named')
    eq(N.Tone('#ff00aa'), '#ff00aa', 'hex')
    eq(N.Tone('#ff00aa80'), '#ff00aa80', 'hex with alpha')
    eq(N.Tone('purple'), nil, 'unknown')
    eq(N.Tone(12), nil, 'number')
end)

test('text row', function()
    local row = firstRow({ label = 'Seats', value = 2 })
    eq(row.type, 'text', 'type')
    eq(row.value, '2', 'value')
    eq(row.scramble, true, 'scramble')
end)

test('unknown row types are skipped', function()
    eq(#N.Menu(menu({ { type = 'chart' }, { label = 'A', value = 'B' } })).pages[1].rows, 1)
end)

test('bar with max and automatic display', function()
    local row = firstRow({ type = 'bar', label = 'Speed', value = 4.8, max = 10 })
    eq(row.value, 0.48, 'value')
    eq(row.display, '4.8', 'display')
    eq(row.segments, 10, 'segments')
end)

test('bar values and segments are clamped', function()
    local row = firstRow({ type = 'bar', label = 'Speed', value = 3, segments = 99 })
    eq(row.value, 1, 'value')
    eq(row.segments, 30, 'segments')
end)

test('slider keeps a custom display', function()
    eq(firstRow({ type = 'slider', label = 'Speed', value = 0.5, display = '219 KM/H' }).display, '219 KM/H')
end)

test('thresholds pick the lowest matching tone', function()
    local thresholds = { { value = 50, tone = 'warning' }, { value = 20, tone = 'danger' } }
    eq(N.ThresholdTone(thresholds, 10), 'danger', 'under both')
    eq(N.ThresholdTone(thresholds, 20), 'danger', 'on a threshold')
    eq(N.ThresholdTone(thresholds, 30), 'warning', 'between')
    eq(N.ThresholdTone(thresholds, 80), nil, 'above')
    eq(firstRow({ type = 'bar', label = 'Fuel', value = 80, max = 100, tone = 'safe', thresholds = thresholds }).tone, 'safe', 'row tone')
    eq(firstRow({ type = 'bar', label = 'Fuel', value = 10, max = 100, thresholds = thresholds }).tone, 'danger', 'row threshold')
end)

test('countdown keeps its end across normalizations', function()
    now = 1000
    local raw = menu({ { type = 'countdown', label = 'Cooldown', value = 10, done = 'Ready' } })
    eq(N.Menu(raw).pages[1].rows[1].remaining, 10000, 'first')
    eq(raw.pages[1].rows[1].endsAt, 11000, 'endsAt')
    now = 4000
    eq(N.Menu(raw).pages[1].rows[1].remaining, 7000, 'later')
    now = 20000
    local row = N.Menu(raw).pages[1].rows[1]
    eq(row.remaining, 0, 'finished')
    eq(row.done, 'Ready', 'done')
end)

test('keys row keeps up to 6 valid keys', function()
    local keys = { { key = 'E', label = 'Open' }, 'invalid', { label = 'no key' } }
    for i = 1, 8 do keys[#keys + 1] = { key = tostring(i) } end
    local row = firstRow({ type = 'keys', keys = keys })
    eq(#row.keys, 6, 'count')
    eq(row.keys[1].label, 'Open', 'label')
end)

test('image row defaults and limits', function()
    local row = firstRow({ type = 'image', src = 'nui://a/b.png', fit = 'stretch', height = 999 })
    eq(row.src, 'nui://a/b.png', 'src')
    eq(row.fit, 'cover', 'fit')
    eq(row.height, 320, 'height')
end)

test('stats row keeps up to 4 items', function()
    local items = {}
    for i = 1, 6 do items[i] = { label = 'L' .. i, value = i, tone = 'nope' } end
    local row = firstRow({ type = 'stats', items = items })
    eq(#row.items, 4, 'count')
    eq(row.items[2].value, '2', 'value')
    eq(row.items[1].tone, nil, 'tone')
end)

test('footer accepts plain values', function()
    local result = N.Menu({ id = 'f', pages = { { rows = {}, footer = { label = 'Rating', items = { 548, { value = '219', icon = 'gauge' } } } } } })
    eq(result.pages[1].footer.items[1].value, '548', 'plain')
    eq(result.pages[1].footer.items[2].icon, 'gauge', 'table')
end)

print(('%d passed, %d failed'):format(passed, failed))
if failed > 0 then os.exit(1) end
