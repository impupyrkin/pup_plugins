/*:
 * @plugindesc Fog plugin
 * @author impupyrkin
 *
 * @help
 * Plugin commands:
 * ShowFog picturename speedX speedY opacity
 * HideFog
 */
(function() {
    Game_Map.prototype.initFog = function() {
        this._fogData = null;
    };

    var _Game_Map_setup = Game_Map.prototype.setup;
    Game_Map.prototype.setup = function(mapid) {
        _Game_Map_setup.call(this, mapid);
        this.initFog();
    };

    Game_Map.prototype.setFog = function(name, speedX, speedY, opacity) {
        this._fogData = {
            "name": name,
            "speedX": speedX || 0.5,
            "speedY": speedY || 0,
            "opacity": opacity != null ? opacity : 160,
            "x": 0,
            "y": 0
        };
    };

    Game_Map.prototype.clearFog = function() {
        this._fogData = null;
    };

    function Sprite_Fog() {
        this.initialize.apply(this, arguments);
    }
    Sprite_Fog.prototype = Object.create(TilingSprite.prototype);
    Sprite_Fog.prototype.constructor = Sprite_Fog;

    Sprite_Fog.prototype.initialize = function() {
        TilingSprite.prototype.initialize.call(this);
        this.scale.x = 2;
        this.scale.y = 2;
        this.camX = 0;
        this.camY = 0;
        this.oX = 0;
        this.oY = 0;
        this.blend_mode = Graphics.BLEND_ADD;
        this.move(0, 0, Graphics.width, Graphics.height);
    };

    Sprite_Fog.prototype.update = function() {
        TilingSprite.prototype.update.call(this);
        var fog = $gameMap._fogData;
        if (fog) {
            this.bitmap = ImageManager.loadParallax(fog.name);
            this.camX = $gameMap.displayX() / 2 * $gameMap.tileWidth();
            this.camY = $gameMap.displayY() / 2 * $gameMap.tileHeight();
            this.oX += fog.speedX;
            this.oY += fog.speedY;
            this.origin.x = this.camX + this.oX;
            this.origin.y = this.camY + this.oY;
            this.opacity = fog.opacity;
        }
    };

    var _Scene_Map_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;
    Scene_Map.prototype.createDisplayObjects = function() {
        _Scene_Map_createDisplayObjects.call(this);
        this.createFog();
    };

    Scene_Map.prototype.createFog = function() {
        this._fogSprite = new Sprite_Fog();
        this._spriteset._baseSprite.addChild(this._fogSprite);
    };

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'ShowFog') {
            var name = args[0];
            var sx = Number(args[1] || 0.5);
            var sy = Number(args[2] || 0);
            var op = args[3] != null ? Number(args[3]) : 160;
            $gameMap.setFog(name, sx, sy, op);
        }
        if (command === 'HideFog') {
            $gameMap.clearFog();
        }
    };
})();
