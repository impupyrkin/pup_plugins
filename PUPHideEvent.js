/*:
 * @plugindesc Hide event on start
 * @author impupyrkin
 *
 * @help
 * To hide event you need type [Hide] in event note
 * If you want hide player type [HidePlayer] in map note
 */

(function() {
    const _Game_Map_setup = Game_Map.prototype.setup;
    Game_Map.prototype.setup = function(mapId) {
        _Game_Map_setup.call(this, mapId);

        this.events().forEach(event => {
            if (event && event.event().note && event.event().note.includes("[Hide]")) {
                event.setTransparent(true);
            }
        });

        $gamePlayer.setTransparent($dataMap.note.includes("[HidePlayer]"));
    };
})();