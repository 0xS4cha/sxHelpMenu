fx_version 'cerulean'
game 'gta5'

name 'sxHelpMenu'
description 'Library to show help menus and info widgets with pages, bars, sliders and a footer, anchored anywhere on screen'
author '0xS4cha'
version '1.3.0'
repository 'https://github.com/0xS4cha/sxHelpMenu'

lua54 'yes'

shared_scripts {
    'core/sh_logger.lua',
    'core/sh_translation.lua',
    'translations/*.lua',
    'core/sh_modules.lua',
    'core/sh_class.lua',
    'core/sh_utils.lua',
    'shared/config.lua',
}

client_scripts {
    'modules/**/cl_*.lua',
    'core/sh_init.lua',
}

ui_page 'web/dist/index.html'

files {
    'lib/menu.lua',
    'web/dist/index.html',
    'web/dist/**/*',
}
