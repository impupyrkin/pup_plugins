/*:
 * @plugindesc Allows characters with different frame counts
 * @author impupyrkin
 *
 *
 * @param Custom Character List
 * @type struct<CustomCharacter>[]
 * @desc List of character with non-standard frame counts.
 * @default []
 *
 * @help
 * ...
 */

/*~struct~CustomCharacter:
 * @param name
 * @type file
 * @dir img/characters/
 * @desc Character sprite file.
 *
 * @param frames
 * @type number
 * @min 1
 * @desc Number of animation frames for this character.
 * 
 * @param speed
 * @type number
 * @min 0
 * @max 10
 * @desc Speed of animation for this character.
 */

(function() {
    var pluginName = document.currentScript.src.match(/([^\/]+)\.js$/)[1];
    var params = PluginManager.parameters(pluginName);

    var characterList = JSON.parse(params['Custom Character List'] || '[]').map(entry => {
        const obj = JSON.parse(entry);
        return {
            name: String(obj.name || ''),
            frames: Number(obj.frames || 3),
            speed: Number(obj.speed || 0)
        };
    });

    var getCharacter = function(name)
    {
        return characterList.find(chr => chr.name == name);
    };

    var isMultiFrames = function(name) {
        return getCharacter(name) !== undefined;
	};
	
	var frameNumber = function(name) {
        return isMultiFrames(name) ? getCharacter(name).frames : 3;
	};

    var characterSpeed = function(name)
    {
        return isMultiFrames(name) ? getCharacter(name).speed : 0;
    }

    var _Game_CharacterBase_maxPattern = Game_CharacterBase.prototype.maxPattern;
	Game_CharacterBase.prototype.maxPattern = function() {
		if (isMultiFrames()) {
			return this.frameNumber();
		} else {
			return _Game_CharacterBase_maxPattern.call(this);
		}
	};
	
	var _Game_CharacterBase_straighten = Game_CharacterBase.prototype.straighten;
	Game_CharacterBase.prototype.straighten = function() {
		if (this.isMultiFrames()) {
			if (this.hasWalkAnime() || this.hasStepAnime()) this._pattern = 0;
			this._animationCount = 0;
		} else {
			_Game_CharacterBase_straighten.call(this);
		}
	};
	
	var _Game_CharacterBase_pattern = Game_CharacterBase.prototype.pattern;
	Game_CharacterBase.prototype.pattern = function() {
		if (this.isMultiFrames()) {
			return this._pattern;
		} else {
			return _Game_CharacterBase_pattern.call(this);
		}
	};
	
	var _Game_CharacterBase_isOriginalPattern = Game_CharacterBase.prototype.isOriginalPattern;
	Game_CharacterBase.prototype.isOriginalPattern = function() {
		if (this.isMultiFrames()) {
			return this.pattern() === 0;
		} else {
			return _Game_CharacterBase_isOriginalPattern.call(this);
		}
	};

	var _Game_CharacterBase_resetPattern = Game_CharacterBase.prototype.resetPattern;
	Game_CharacterBase.prototype.resetPattern = function() {
		if (this.isMultiFrames()) {
			this.setPattern(0);
		} else {
			_Game_CharacterBase_resetPattern.call(this);
		}
	};

	var _Game_CharacterBase_animationWait = Game_CharacterBase.prototype.animationWait;
	Game_CharacterBase.prototype.animationWait = function() {
		var wait = _Game_CharacterBase_animationWait.call(this);
		return Math.max(wait * this.animationWaitSpeed() / 10, 2);
	};
	
	Game_CharacterBase.prototype.isMultiFrames = function() {
		return isMultiFrames(this._characterName);
	};
	
	Game_CharacterBase.prototype.frameNumber = function() {
		return frameNumber(this._characterName);
	};				
	
	Game_CharacterBase.prototype.animationWaitSpeed = function() {
		return Math.max(10 - characterSpeed(this._characterName), 0);
	};
	
	var _Sprite_Character_characterBlockX = Sprite_Character.prototype.characterBlockX;
	Sprite_Character.prototype.characterBlockX = function() {
		if (this._character.isMultiFrames() && !this._isBigCharacter) {
			var index = this._character.characterIndex();
			return index % 4 * this._character.frameNumber();
		} else {
			return _Sprite_Character_characterBlockX.call(this);
		}
	};

	var _Sprite_Character_patternWidth = Sprite_Character.prototype.patternWidth;
	Sprite_Character.prototype.patternWidth = function() {
		if (this._tileId === 0 && this._character.isMultiFrames()) {
			if (this._isBigCharacter) {
				return this.bitmap.width / this._character.frameNumber();
			} else {
				return this.bitmap.width / (this._character.frameNumber() * 4);
			}
		} else {
			return _Sprite_Character_patternWidth.call(this);
		}
	};
	
	var _Window_Base_drawCharacter = Window_Base.prototype.drawCharacter;
	Window_Base.prototype.drawCharacter = function(characterName, characterIndex, x, y) {
		if (isMultiFrames(characterName)) {
			var frames = frameNumber(characterName);
			var bitmap = loadCharacter(characterName);
			var big = ImageManager.isBigCharacter(characterName);
			var pw = bitmap.width / (big ? frames : frames * 4);
			var ph = bitmap.height / (big ? 4 : 8);
			var n = characterIndex;
			var sx = (n % 4 * 3 + 1) * pw;
			var sy = (Math.floor(n / 4) * 4) * ph;
			this.contents.blt(bitmap, sx, sy, pw, ph, x - pw / 2, y - ph);
		} else {
			_Window_Base_drawCharacter.call(this, characterName, characterIndex, x, y)
		}

	};

    var _Game_CharacterBase_updatePattern = Game_CharacterBase.prototype.updatePattern;
    Game_CharacterBase.prototype.updatePattern = function() {
        if (!this.isMultiFrames())
        {
            _Game_CharacterBase_updatePattern.call(this);
            return;
        }

        if (this.hasStepAnime() || (this.hasWalkAnime() && this.isMoving())) {
            this._pattern++;
            if (this._pattern >= this.frameNumber()) {
                this._pattern = 0;
            }
        } else {
            this._pattern = 0;
        }
    };
})(); 
