-- sxHelpMenu builder
-- Add `client_script '@sxHelpMenu/lib/menu.lua'` to the fxmanifest.lua of your resource.

local resource = 'sxHelpMenu'

local Page = {}
Page.__index = Page

local function addRow(self, kind, label, value, options)
    local row = {}
    if type(options) == 'table' then
        for k, v in pairs(options) do row[k] = v end
    end
    row.type = kind
    row.label = label
    row.value = value
    self.rows[#self.rows + 1] = row
    return self
end

function Page:Text(label, value, options)
    return addRow(self, 'text', label, value, options)
end

function Page:Bar(label, value, options)
    return addRow(self, 'bar', label, value, options)
end

function Page:Slider(label, value, options)
    return addRow(self, 'slider', label, value, options)
end

function Page:Countdown(label, seconds, options)
    addRow(self, 'countdown', label, seconds, options)
    local row = self.rows[#self.rows]
    row.endsAt = row.endsAt or (GetGameTimer() + (tonumber(seconds) or 0) * 1000)
    return self
end

function Page:Footer(label, items)
    self.footer = { label = label, items = items or {} }
    return self
end

function Page:Header(subtitle, title, options)
    self.header = { subtitle = subtitle, title = title }
    if type(options) == 'table' then
        for k, v in pairs(options) do self.header[k] = v end
    end
    return self
end

local Menu = {}
Menu.__index = Menu

function Menu:Header(subtitle, title, options)
    self.data.header = { subtitle = subtitle, title = title }
    if type(options) == 'table' then
        for k, v in pairs(options) do self.data.header[k] = v end
    end
    return self
end

function Menu:Page(title, icon, id)
    local page = setmetatable({ title = title, icon = icon, id = id, rows = {} }, Page)
    self.data.pages[#self.data.pages + 1] = page
    return page
end

function Menu:Position(position, offset)
    self.data.position = position
    if offset then self.data.offset = offset end
    return self
end

function Menu:Set(key, value)
    self.data[key] = value
    return self
end

local function serialize(data)
    local pages = {}
    for i, page in ipairs(data.pages) do
        pages[i] = {
            id = page.id,
            title = page.title,
            icon = page.icon,
            header = page.header,
            rows = page.rows,
            footer = page.footer,
        }
    end

    local menu = {}
    for k, v in pairs(data) do menu[k] = v end
    menu.pages = pages
    return menu
end

function Menu:Show(duration)
    if duration then self.data.duration = duration end
    self.id = exports[resource]:Show(serialize(self.data))
    self.data.id = self.id
    return self
end

function Menu:ShowThisFrame()
    if self.data.id == nil then
        self.data.id = ('%s_%s'):format(GetCurrentResourceName(), tostring(self):gsub('table: ', ''))
    end
    if self.id and exports[resource]:ShowThisFrame(self.id) then
        return self
    end
    self.id = exports[resource]:ShowThisFrame(serialize(self.data))
    return self
end

function Menu:Refresh()
    if self.id and exports[resource]:IsVisible(self.id) then
        exports[resource]:Show(serialize(self.data))
    end
    return self
end

function Menu:SetRow(rowId, patch)
    for _, page in ipairs(self.data.pages) do
        for _, row in ipairs(page.rows) do
            if row.id == rowId then
                for k, v in pairs(patch) do row[k] = v end
            end
        end
    end
    if self.id then
        exports[resource]:UpdateRow(self.id, rowId, patch)
    end
    return self
end

function Menu:SetPage(page)
    if self.id then exports[resource]:SetPage(self.id, page) end
    return self
end

function Menu:GetPage()
    return self.id and exports[resource]:GetPage(self.id) or nil
end

function Menu:IsVisible()
    return self.id ~= nil and exports[resource]:IsVisible(self.id)
end

function Menu:Hide()
    if self.id then exports[resource]:Hide(self.id) end
    return self
end

HelpMenu = {}

function HelpMenu.new(id, options)
    local data = { id = id, pages = {} }
    if type(options) == 'table' then
        for k, v in pairs(options) do
            if k ~= 'pages' then data[k] = v end
        end
    end
    return setmetatable({ id = nil, data = data }, Menu)
end

function HelpMenu.Show(menu) return exports[resource]:Show(menu) end
function HelpMenu.ShowThisFrame(menu) return exports[resource]:ShowThisFrame(menu) end
function HelpMenu.Hide(id) return exports[resource]:Hide(id) end
function HelpMenu.Update(id, patch) return exports[resource]:Update(id, patch) end
function HelpMenu.UpdateRow(id, rowId, patch) return exports[resource]:UpdateRow(id, rowId, patch) end
function HelpMenu.SetPage(id, page) return exports[resource]:SetPage(id, page) end
