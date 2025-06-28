fx_version 'cerulean'
game 'gta5'
lua54 'yes'

author 'EJJ'
version '1.0.0'

ui_page 'web/build/index.html'

client_scripts {
    'client/client.lua',
    'client/main.lua',
    'client/voice.lua',
}

server_scripts {
    'server/server.lua',
}

shared_scripts {
    '@ox_lib/init.lua',
    'config/config.lua',
}

files {
    'web/build/**/*',
    'stream/*.gfx'
}

data_file 'SCALEFORM_DLC_FILE' 'stream/*.gfx'