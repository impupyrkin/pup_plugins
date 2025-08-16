/*:
 * @plugindesc Footsteps plugin
 * @author impupyrkin
 *
 * @help
 * Assign regionId on the map.
 * Add [Footsteps] to an event note to enable footsteps for that event.
 *
 * @param Footstep List
 * @type struct<Footstep>[]
 * @default []
 * @desc List mapping regionId to footstep sound.
 *
 * @param Walk Timeout
 * @type number
 * @min 1
 * @default 20
 * @desc Delay in frames between step sounds when walking.
 *
 * @param Run Timeout
 * @type number
 * @min 1
 * @default 10
 * @desc Delay in frames between step sounds when running.
 */

/*~struct~Footstep:
 * @param regionId
 * @type number
 * @min 1
 * @desc Region ID where this sound will play.
 *
 * @param name
 * @type file
 * @dir audio/se/
 * @desc Sound file name.
 *
 * @param volume
 * @type number
 * @min 0
 * @max 100
 * @default 90
 * @desc Sound volume.
 *
 * @param pan
 * @type number
 * @min -100
 * @max 100
 * @default 0
 * @desc Sound pan.
 */
(function() {

    const pluginName = document.currentScript.src.match(/([^\/]+)\.js$/)[1];
    const params = PluginManager.parameters(pluginName);

    const footstepList = JSON.parse(params['Footstep List'] || '[]').map(entry => {
        const obj = JSON.parse(entry);
        return {
            regionId: Number(obj.regionId || 0),
            name: String(obj.name || ''),
            volume: Number(obj.volume || 90),
            pan: Number(obj.pan || 0)
        };
    });

    const walkTimeout = Number(params['Walk Timeout'] || 20);
    const runTimeout = Number(params['Run Timeout'] || 10);

    function getFootstepSound(regionId) {
        return footstepList.find(fs => fs.regionId === regionId);
    }

    function pitchForCharacter(chara) {
        const speed = chara.realMoveSpeed ? chara.realMoveSpeed() : chara._moveSpeed;
        const base = 100 + (speed - 5) * 10;
        const randomOffset = Math.floor(Math.random() * 5);
        return base + randomOffset;
    }

    const _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _Scene_Map_start.call(this);
        this._footstepDelayCounter = 0;
    };

    const _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);
        if (this._footstepDelayCounter < 60) {
            this._footstepDelayCounter++;
        } else {
            this.updateFootSteps();
        }
    };

    Scene_Map.prototype.updateFootSteps = function() {
        if ($gamePlayer.isMoving()) {
            this.tryPlayFootstep($gamePlayer);
        }
        $gameMap.events().forEach(ev => {
            if (ev.isMoving() && ev.hasFootstepsTag()) {
                this.tryPlayFootstep(ev);
            }
        });
    };

    Scene_Map.prototype.tryPlayFootstep = function(chara) {
        const now = Graphics.frameCount;
        chara._lastFootstepTime = chara._lastFootstepTime || 0;
        const isRunning = chara.isDashing && chara.isDashing();
        const timeout = isRunning ? runTimeout : walkTimeout;
        if (now - chara._lastFootstepTime >= timeout) {
            this.playFootstepForCharacter(chara);
            chara._lastFootstepTime = now;
        }
    };

    Scene_Map.prototype.playFootstepForCharacter = function(chara) {
        const regionId = $gameMap.regionId(chara.x, chara.y);
        const sound = getFootstepSound(regionId);

        if (sound && sound.name) {
            const isEvent = chara instanceof Game_Event;
            const volume = isEvent ? Math.floor(sound.volume * 0.2) : sound.volume;

            AudioManager.playSe({
                name: sound.name,
                volume: volume,
                pitch: pitchForCharacter(chara),
                pan: sound.pan
            });
        }
    };

    Game_Event.prototype.hasFootstepsTag = function() {
        return !!this.event().note.includes("[Footsteps]");
    };

})();
