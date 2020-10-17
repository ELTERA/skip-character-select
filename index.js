const path = require('path');
const fs = require('fs');

if(!fs.existsSync(path.join(__dirname, './data'))) {
    fs.mkdirSync(path.join(__dirname, './data'));
}

function getJsonData(pathToFile) {
    try {
        return JSON.parse(fs.readFileSync(path.join(__dirname, pathToFile)));
    }catch(e) {
        return undefined;
    }
}

function saveJsonData(pathToFile, data) {
    fs.writeFileSync(path.join(__dirname, pathToFile), JSON.stringify(data, null, "    "));
}

module.exports = function SkipCharacterSelect(dispatch) {	
    /*
        Let character select screen and client account settings to finish loading. May need to be adjusted for your CPU/HDD/SSD.
        No delay works but sometimes the "wind sound effect" will continue to play or some screen artefacts appears.
	You can tune it to match your PC performace.
    */
    const delay = 8000; 

    let settingsPath,
    enabled = true;
            
    dispatch.hook('S_LOGIN_ACCOUNT_INFO', 2, (event) => {
        settingsPath = `./data/${event.serverName}.json`;
        if (!enabled) return;
        
        let data = getJsonData(settingsPath);
        if (data) {
            setTimeout(()=>{
                dispatch.toServer('C_SELECT_USER', 1, Object.assign({}, data));
            }, delay);
        }
        enabled = false;
    });
    
    dispatch.hook('C_SELECT_USER', 1, (event) => {
        saveJsonData(settingsPath, Object.assign({}, event));
    });

    // Instant game exit
    dispatch.hook('S_PREPARE_EXIT', 1, (event) => {
        dispatch.toClient('S_EXIT', 3, {});
    });
	
    // Instant character selection screen
    dispatch.hook('S_PREPARE_RETURN_TO_LOBBY', 1, (event) => {
        dispatch.toClient('S_RETURN_TO_LOBBY', 1, {});
    });
    
}
