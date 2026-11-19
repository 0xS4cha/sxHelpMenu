Config = {}

Config.Keys = {
    nextPage = 'R',
    control = nil,
}

Config.Defaults = {
    position = 'bottom-right',
    offset = { x = 2.5, y = 6.0 },
    width = 360,
    scale = 1.0,
    gap = 1.2,
    glass = true,
}

Config.Glass = {
    enabled = true,
    fps = 60,
    downscale = 4,
    strength = 2,
}

Config.Hide = {
    pauseMenu = true,
    hudHidden = true,
    screenFaded = true,
    cinematic = false,
    interval = 100,
}

Config.StackLimit = 3

Config.TickTimeout = 100

Config.Positions = {
    'top-left', 'top', 'top-right',
    'left', 'center', 'right',
    'bottom-left', 'bottom', 'bottom-right',
}
