/*:
 * @plugindesc Allows display text on the map
 * @author impupyrkin
 *
 * @help
 * event 0 - player
 * event -1 - current event
 * Plugin Commands:
 * ShowMapText event x y text duration
 */

(function() {
    var _Game_Map_setup = Game_Map.prototype.setup;
    Game_Map.prototype.setup = function(mapid) {
        _Game_Map_setup.call(this, mapid);
        this._mapText = [];
    };

    Game_Map.prototype.addText = function(eventId, x, y, text, duration) {
        this._mapText.push({
            eventId: Number(eventId),
            offsetX: Number(x),
            offsetY: Number(y),
            text: String(text),
            duration: Number(duration),
            alpha: 0,
            fading: false
        });
    };

    var _Game_Map_update = Game_Map.prototype.update;
    Game_Map.prototype.update = function(sceneActive) {
        _Game_Map_update.call(this, sceneActive);
        var toDelete = [];

        this._mapText.forEach((t, i) => {
            if (!t.fading) {
                t.alpha += 25;
                t.duration--;
                if (t.duration <= 0) {
                    t.fading = true;
                }
            } else {
                t.alpha -= 15;
                if (t.alpha <= 0) {
                    toDelete.push(i);
                }
            }
        });

        toDelete.reverse().forEach(i => {
            this._mapText.splice(i, 1);
        });
    };

    var _Scene_Map_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;
    Scene_Map.prototype.createDisplayObjects = function() {
        _Scene_Map_createDisplayObjects.call(this);

        this._mapTextSprite = new Sprite();
        this._mapTextSprite.bitmap = new Bitmap(Graphics.width, Graphics.height);
        this._spriteset.addChild(this._mapTextSprite);
    };

    var _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);
        this._mapTextSprite.bitmap.clear();

        $gameMap._mapText.forEach(t => {
            var ev = null;
            if (t.eventId === 0) {
                ev = $gamePlayer;
            } else {
                ev = $gameMap.event(t.eventId);
            }

            if (ev) {
                var screenX = ev.screenX() + t.offsetX - Graphics.width / 8;
                var screenY = ev.screenY() + t.offsetY - 48;
                this._mapTextSprite.bitmap.paintOpacity = t.alpha;
                this._mapTextSprite.bitmap.drawText(
                    t.text,
                    screenX,
                    screenY,
                    Graphics.width / 4,
                    48,
                    "center"
                );
            }
        });

        this._mapTextSprite.bitmap.paintOpacity = 255;
    };

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === "ShowMapText") {
            var eventId = args[0];
            if (Number(eventId) == -1)
            {
                eventId = this.eventId();
            }
            var x = args[1];
            var y = args[2];
            var text = args.slice(3, args.length - 1).join(" ");
            var duration = args[args.length - 1];
            $gameMap.addText(eventId, x, y, text, duration);
        }
    };
})();
