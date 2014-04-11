function HTMLActuator() {
  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer   = document.querySelector(".score-container");
  this.bestContainer    = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");
  this.sharingContainer = document.querySelector(".score-sharing");

  this.score = 0;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);
    self.updateBestLvScore(metadata.bestLvScore);

    if (metadata.terminated) {
      if (metadata.over) {
        self.message(false, metadata.lvScore); // You lose
      } else if (metadata.won) {
        self.message(true, metadata.lvScore); // You win!
      }
    }

  });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continueGame = function () {
  if (typeof ga !== "undefined") {
    ga("send", "event", "game", "restart");
  }
  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile) {
  var self = this;

  var wrapper   = document.createElement("div");
  var inner     = document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];

  if (tile.value > 2048) classes.push("tile-super");

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");
  inner.textContent = tile.value;

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }

  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);

  // Put the tile on the board
  this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.bestContainer.textContent = bestScore;
};

HTMLActuator.prototype.updateBestLvScore = function (bestLvScore) {
	var activeLevelObjs = document.querySelectorAll(".active-level");
	for( var i = 0; i < activeLevelObjs.length; ++i) {
		var activeLevelObj = activeLevelObjs[i];
		var levelScore = activeLevelObj.getAttribute("data-level-score");
		if (parseInt(levelScore) > parseInt(bestLvScore)) {
			if (activeLevelObj.style.display != "none") {
				activeLevelObj.style.display = "none";
			}
		} else {
			if (activeLevelObj.style.display != "inline") {
				activeLevelObj.style.display = "inline";
			}
		}
	}
	var inactiveLevelObjs = document.querySelectorAll(".inactive-level");
	for ( var i = 0; i < inactiveLevelObjs.length; ++i) {
		var inactiveLevelObj = inactiveLevelObjs[i];
		var levelScore = inactiveLevelObj.getAttribute("data-level-score");
		if (parseInt(levelScore) > parseInt(bestLvScore)) {
			if (inactiveLevelObj.style.display != "inline") {
				inactiveLevelObj.style.display = "inline";
			}
		} else {
			if (inactiveLevelObj.style.display != "none") {
				inactiveLevelObj.style.display = "none";
			}
		}
	}
};

HTMLActuator.prototype.message = function (won, lvScore) {
  var wugMessages  = new Array(12);
  wugMessages[0]   = { "text" : "真夢:「諦めじゃダメです」", "style" : {"fontSize" : "38px", "lineHeight" : "38px", "height" : "38px"}, "soundId" : "mayu"}; // M 40:52
  wugMessages[1]   = { "text" : "藍里:「私はもっと頑張らないとなー」", "style" : {"fontSize" : "28px", "lineHeight" : "28px", "height" : "28px"}, "soundId" : "airi"}; // 06 11:30
  wugMessages[2]   = { "text" : "実波:「うんめえ～にゃ～」", "style" : {"fontSize" : "36px", "lineHeight" : "36px", "height" : "36px"}, "soundId" : "minami"}; // 03 08:32
  wugMessages[3]   = { "text" : "佳乃:「自覚持っとうよっ」", "style" : {"fontSize" : "36px", "lineHeight" : "36px", "height" : "36px"}, "soundId" : "yoshino"}; // 06 07:59
  wugMessages[4]   = { "text" : "菜々美:「私も中途半端をやめる！」", "style" : {"fontSize" : "30px", "lineHeight" : "30px", "height" : "30px"}, "soundId" : "nanami"}; // 09 20:18
  wugMessages[5]   = { "text" : "夏夜:「あー惜しい、次は行ける！」", "style" : {"fontSize" : "30px", "lineHeight" : "30px", "height" : "30px"}, "soundId" : "kaya"}; // 07 12:02
  wugMessages[6]   = { "text" : "未夕:「みゅーのウイルスが激烈蔓延中だぁーっ！」", "style" : {"fontSize" : "36px", "lineHeight" : "54px", "height" : "108px"}, "soundId" : "miyu"}; // 01 16:27
  wugMessages[7]   = { "text" : "志保:「良くもう一度戻ってくる気になったわねっ！」", "style" : {"fontSize" : "36px", "lineHeight" : "54px", "height" : "108px"}, "soundId" : "shiho"}; // 05 21:53
  wugMessages[8]   = { "text" : "麻衣:「感心してる場合？」", "style" : {"fontSize" : "36px", "lineHeight" : "36px", "height" : "36px"}, "soundId" : "mai"}; // 08 05:44
  wugMessages[9]   = { "text" : "愛:「また来てね、待ってるから♥」", "style" : {"fontSize" : "30px", "lineHeight" : "30px", "height" : "30px"}, "soundId" : "megumi"}; // 05 21:20
  wugMessages[10]  = { "text" : "菜野花:「新曲の事聞いてる？」", "style" : {"fontSize" : "32px", "lineHeight" : "32px", "height" : "32px"}, "soundId" : "nanoka"}; // 11 07:51
  wugMessages[11]  = { "text" : "早坂:「練習の成果見せてもらうよ」", "style" : {"fontSize" : "30px", "lineHeight" : "30px", "height" : "30px"}, "soundId" : "hayasaka"}; // 11 12:16
  var wonMessage   = { "text" : "白木:「勝ったのはあいつらだ。」", "style" : {"fontSize" : "30px", "lineHeight" : "30px", "height" : "30px"}, "soundId" : "shiraki"};
  var superMseeage = { "text" : "Wake Up, Girls!", "soundId" : "wakeupgirls"};
  
  var calcLevel = function (n) { var r = 0; while (n > 1) r++, n >>= 1; return r; };
  var level   = calcLevel(lvScore);
  var type    = won ? "game-won" : "game-over";
  var message = won ? wonMessage.text : level > wugMessages.length ? superMseeage.text : wugMessages[level-1].text;
  var style   = won ? wonMessage.style : level > wugMessages.length ? superMseeage.style : wugMessages[level-1].style;
  var soundId = won ? wonMessage.soundId : level > wugMessages.length ? superMseeage.soundId : wugMessages[level-1].soundId;
  if (typeof ga !== "undefined") {
    ga("send", "event", "game", "end", type, this.score);
  }
  
  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;
  this.clearContainer(this.sharingContainer);
  this.sharingContainer.appendChild(this.scoreTweetButton());
  if(typeof twttr !== "undefined") {
  	twttr.widgets.load();
  }
  if(style) {
  	  for(var property in style) {
  	  	  this.messageContainer.getElementsByTagName("p")[0].style[property] = style[property];
  	  }
  }
  if(soundId) {
  	  window.setTimeout(function() {document.getElementById(soundId).play();}, 1000);
  }
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
  this.messageContainer.getElementsByTagName("p")[0].removeAttribute("style");
};

HTMLActuator.prototype.scoreTweetButton = function () {
  var tweet = document.createElement("a");
  tweet.classList.add("twitter-share-button");
  tweet.setAttribute("href", "https://twitter.com/share");
  tweet.setAttribute("data-via", "KyoHiroki");
  tweet.setAttribute("data-url", "http://kyohiroki.github.io/2048-wug/");
  tweet.setAttribute("data-text", this.messageContainer.getElementsByTagName("p")[0].textContent);
  tweet.textContent = "Tweet";

  return tweet;
};