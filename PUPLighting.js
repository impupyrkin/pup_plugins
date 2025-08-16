/*:
 * @plugindesc Lighting plugin
 * @author impupyrkin
 *
 * @help
 * event 0 - player
 * event -1 - current event
 * Plugin commands:
 * SetAmbientColor r g b
 * AddLight event color opacity width height
 * RemoveLight event
 */
(function() {
    var _Scene_Map_createDisplayObject = Scene_Map.prototype.createDisplayObjects;
    Scene_Map.prototype.createDisplayObjects = function() {
        _Scene_Map_createDisplayObject.call(this);
        this.createLighting();
    }

    Scene_Map.prototype.createLighting = function() {
        this._lightingSprite = new Sprite();
        this._lightingSprite.blendMode = Graphics.BLEND_MULTIPLY;
        this._lightingSprite.bitmap = new Bitmap(Graphics.width, Graphics.height);
        this._lightingGlowSprite = new Sprite();
        this._lightingGlowSprite.opacity = 75;
        this._lightingGlowSprite.blendMode = Graphics.BLEND_ADD;
        this._lightingGlowSprite.bitmap = new Bitmap(Graphics.width, Graphics.height);

        this._spriteset._baseSprite.addChild(this._lightingSprite);
        this._spriteset._baseSprite.addChild(this._lightingGlowSprite);
    }

    var _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);
        this.updateLighting();
    }
    
    Scene_Map.prototype.updateLighting = function() {
        this._lightingGlowSprite.bitmap.clear(0, 0, Graphics.width, Graphics.height);
        this._lightingSprite.bitmap.fillAll($gameMap.ambientColorCSS());

        for (var i = 0; i < $gameMap.lightSourceCount(); i++)
        {
            var _lightSource = $gameMap.lightSource(i);
            var _lightImage = ImageManager.loadPicture("light_" + _lightSource.color, 0);
            var _lightEvent = undefined;

            if (_lightSource.event == 0)
            {
                _lightEvent = $gamePlayer;
            }
            else if (_lightSource.event > 0)
            {
                _lightEvent = $gameMap.event(_lightSource.event);
            }

            var _lightX = _lightEvent.screenX() - _lightSource.width / 2;
            var _lightY = _lightEvent.screenY() - _lightSource.height / 2 - 48;

            this._lightingGlowSprite.bitmap.paintOpacity = _lightSource.alpha;
            this._lightingGlowSprite.bitmap.blt(
                _lightImage, 0, 0, 256, 256,
                _lightX, _lightY, _lightSource.width, _lightSource.height
            );
        }
        this._lightingGlowSprite.bitmap.paintOpacity = 255;
        this._lightingSprite.bitmap.blt(
            this._lightingGlowSprite.bitmap, 0, 0, 
            Graphics.width, Graphics.height, 0, 0
        );
    }

    var _Game_Map_setup = Game_Map.prototype.setup;
    Game_Map.prototype.setup = function(mapId) {
        _Game_Map_setup.call(this, mapId);
        this._needsRefresh = true;
        this.setupLighting();
        this._needsRefresh = false;
    }

    Game_Map.prototype.setupLighting = function() {
        this._ambientColor = [255, 255, 255, 255];
        this._lightSources = [];
    }

    Game_Map.prototype.addLight = function(event, color, alpha, width, height) {
        this._lightSources.push({
            event: Number(event),
            alpha: Number(alpha).clamp(0, 255),
            color: color,
            width: Number(width),
            height: Number(height)
        });
    }

    Game_Map.prototype.removeLight = function(event) {
        var index = this._lightSources.findIndex(light => light.event == event);
        this._lightSources.splice(index, 1);
    }

    Game_Map.prototype.lightSourceCount = function() {
        return this._lightSources.length;
    }
    
    Game_Map.prototype.lightSource = function(index) {
        return this._lightSources[index];
    }

    Game_Map.prototype.setAmbientColor = function(color) {
        this._ambientColor = color;
    }

    Game_Map.prototype.ambientColor = function() {
        return this._ambientColor;
    }

    Game_Map.prototype.ambientColorCSS = function() {
        return "rgb(" + this._ambientColor[0].toString() + "," + 
                this._ambientColor[1].toString() + "," +
                this._ambientColor[2].toString() + ")";
    }

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args)  {
        _Game_Interpreter_pluginCommand.call(this, command, args);

        if (command == "SetAmbientColor") {
            $gameMap.setAmbientColor([args[0], args[1], args[2]]);
        }

        if (command == "AddLight") {
            var eventId = Number(args[0]);
            if (eventId === -1) {
                eventId = this.eventId();
            }
            $gameMap.addLight(eventId, args[1], args[2], args[3], args[4]);
        }

        if (command == "RemoveLight") {
            var eventId = Number(args[0]);
            if (eventId === -1) {
                eventId = this.eventId();
            }
            $gameMap.removeLight(eventId);
        }
    }

})();