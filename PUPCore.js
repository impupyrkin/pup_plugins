/*:
 * @plugindesc Core for my games
 * @author impupyrkin
 * 
 * @param Screen Width
 * @type number
 * @default 816
 * 
 * @param Screen Height
 * @type number
 * @default 624
 * 
 * @param Common Event ID
 * @type common_event
 * @default 1
 * 
 */

(function() {
    var parameters = PluginManager.parameters('PUPCore');
    var commonEventId = Number(parameters['Common Event ID'] || 1);
    var screenWidth = Number(parameters['Screen Width'] || 816);
    var screenHeight = Number(parameters['Screen Height'] || 624);

    var _Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
        _Game_System_initialize.call(this);
        this._firstMapEventPlayed = false;
    };

    var _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _Scene_Map_start.call(this);
        if (!$gameSystem._firstMapEventPlayed) {
            if ($gameTemp && commonEventId > 0) {
                $gameTemp.reserveCommonEvent(commonEventId);
            }
            $gameSystem._firstMapEventPlayed = true;
        }
    };

    var _Game_Player_canMove = Game_Player.prototype.canMove;
    Game_Player.prototype.canMove = function() {
        if (this.isOnLadder()) {
            this._dashDisabledOnLadder = true;
        } else {
            this._dashDisabledOnLadder = false;
        }
        return _Game_Player_canMove.call(this);
    };

    var _Game_Player_isDashButtonPressed = Game_Player.prototype.isDashButtonPressed;
    Game_Player.prototype.isDashButtonPressed = function() {
        if (this._dashDisabledOnLadder) {
            return false;
        }
        return _Game_Player_isDashButtonPressed.call(this);
    };

    if (!Utils.isMobileDevice()) {
        TouchInput.update = function() {};
        document.body.style.cursor = 'none';
    }

    var _Game_Map_setup = Game_Map.prototype.setup;
    Game_Map.prototype.setup = function(mapId) {
        _Game_Map_setup.call(this, mapId);
        if ($gameScreen) {
            $gameScreen.clearTone();
        }
    };

    
    SceneManager._screenWidth       = screenWidth;
    SceneManager._screenHeight      = screenHeight;
    SceneManager._boxWidth          = screenWidth;
    SceneManager._boxHeight         = screenHeight;
})();
