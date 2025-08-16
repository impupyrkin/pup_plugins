/*:
 * @plugindesc Allow setting custom music for troops
 * @author impupyrkin
 *
 * @param Troop BGMs
 * @type struct<TroopBGM>[]
 * @default []
 */

/*~struct~TroopBGM:
 * @param Troop
 * @type troop
 * @desc Troop ID.
 * @default

 * @param Name
 * @type file
 * @dir audio/bgm
 * @desc Music name.
 * @default
 *
 * @param Volume
 * @type number
 * @min 0
 * @max 100
 * @desc Music volume.
 * @default 90
 *
 * @param Pitch
 * @type number
 * @min 50
 * @max 150
 * @desc Music pitch.
 * @default 100
 *
 * @param Pan
 * @type number
 * @min -100
 * @max 100
 * @desc Music pan.
 * @default 0
 */

(function() {
    var parameters = PluginManager.parameters(document.currentScript.src.match(/([^\/]+)\.js$/)[1]);
    var troopBGMData = JSON.parse(parameters['Troop BGMs'] || '[]').map(function(item) {
        return item ? JSON.parse(item) : null;
    });

    var _BattleManager_playBattleBgm = BattleManager.playBattleBgm;
    BattleManager.playBattleBgm = function() {
        var troopId = $gameTroop._troopId;
        var data = troopBGMData.find(troop => troop.Troop == troopId);
        if (data && data.Name) {
            AudioManager.playBgm({
                name: data.Name,
                volume: Number(data.Volume || 90),
                pitch: Number(data.Pitch || 100),
                pan: Number(data.Pan || 0)
            });
        } else {
            _BattleManager_playBattleBgm.call(this);
        }
    };
})();