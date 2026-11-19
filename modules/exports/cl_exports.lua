exports("Show", function(menu)
    return SX.Menu:Show(menu, GetInvokingResource())
end)

exports("ShowThisFrame", function(menu)
    return SX.Menu:ShowThisFrame(menu, GetInvokingResource())
end)

exports("Update", function(id, patch)
    return SX.Menu:Update(id, patch)
end)

exports("UpdateRow", function(id, rowId, patch)
    return SX.Menu:UpdateRow(id, rowId, patch)
end)

exports("Hide", function(id)
    return SX.Menu:Hide(id)
end)

exports("HideAll", function()
    SX.Menu:HideAll(GetInvokingResource())
end)

exports("SetHidden", function(hidden)
    SX.Menu:SetHidden(GetInvokingResource(), hidden)
end)

exports("IsHidden", function()
    return SX.Menu:IsHidden()
end)

exports("SetPage", function(id, page)
    return SX.Menu:SetPage(id, page)
end)

exports("GetPage", function(id)
    return SX.Menu:GetPage(id)
end)

exports("IsVisible", function(id)
    return SX.Menu:IsVisible(id)
end)

exports("GetFocused", function()
    return SX.Menu:GetFocused()
end)

exports("GetPositions", function()
    return Config.Positions
end)
