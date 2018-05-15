const $board = $(".minesbox");
const ROWS = 10;
const COLS = 10;

function createBoard(rows, cols) {
	$board.empty();
	for(var i = 0; i < rows; i++) {
		const $row = $('<div>').addClass('row');
		for(var j = 0; j < cols; j++) {
			const $col = $('<div>')
			.addClass('col hiddens')
			.attr('data-row', i)
			.attr('data-col', j);
			if(Math.random() < 0.15) {
				$col.addClass('bomb')
			}
			$row.append($col);
		}
		$board.append($row);
	}
}

createBoard(ROWS,COLS);

var clickHandler = function(e) {
	const $cell = $(this);
	const row = $cell.data('row');
	const col = $cell.data('col');
	switch(e.button) {
		case 2: //right click event
		e.preventDefault();
		//bring flag icon and change state to flagged
		if($cell.hasClass("hiddens")) {
			$cell.toggleClass("flagged");
		}
		if($cell.hasClass("flagged")) {
			$cell.addClass("hiddens");
		}
		break;

		case 0: //left click event
		if($cell.hasClass("flagged")) return;
		if($cell.hasClass('bomb')) {
			gameOver(false);
		}
		else {
			//main MineSweeper algorithm comes here
			reveal(row, col);
			const isGameOver = $('.col.hiddens').length === $('.col.bomb').length;
			if(isGameOver) gameOver(true);
		}
	}
};

$board.on('click', '.col.hiddens', clickHandler); //For left click on MinesBox
$board.on('contextmenu', '.col', clickHandler); //For right click on MinesBox


function reveal(oi, oj) {
	//Let's use a depth first search
	const seen = {}; //creat a new map called seen

	//create helper function
	function helper(i, j) { //tracks of where our recursion is going
		//base case - if i is out of bounds
		if(i >= ROWS || j >= COLS || i < 0 || j < 0) return;
		const key = `${i} ${j}`;
		if(seen[key]) return; //another base case
		const $cell = 
			$(`.col.hiddens[data-row=${i}][data-col=${j}]`);
		const mineCount = getMineCount(i,j);

		if(!$cell.hasClass('hiddens') || $cell.hasClass('bomb')) {
			return;
		}

		$cell.removeClass('hiddens');

		if(mineCount) { //This will stop recursive function once we encounter a box that has a number in it
			if(!$cell.hasClass("flagged")) $cell.text(mineCount);
			return;
		}

		for(var di = -1; di<=1; di++) {
			for(var dj = -1; dj<=1; dj++) {
				helper(i+di, j+dj);
			}
		}
	}

	helper(oi, oj);
}

function getMineCount(i, j) { //counts the number of mines that are adjacent to the box that we clicked
	var count = 0;
	for(var di = -1; di<=1; di++) {
		for(var dj = -1; dj<=1; dj++) {
			const ni = i + di;
			const nj = j + dj;
			if(ni >= ROWS || nj >= COLS || ni < 0 || nj < 0) continue;
			const $cell = $(`.col.hiddens[data-row=${ni}][data-col=${nj}]`);
			if($cell.hasClass('bomb')) count++;
		}
	}
	return count;
}

function gameOver(isWin) {
	var message = null;
	var icon = null;
	if(isWin) {
		message = 'Congratulations!!! You have won the game!!!';
		iconClass = "flagged";
	}
	else {
		message = 'Aww!! Sorry, better luck next time!!';
		iconClass = "bombed";
	}
	$('.col.flagged').removeClass("flagged");
	$('.col.bomb').addClass(iconClass);
	$('.col:not(.bomb)').html(function() {
		const $cell = $(this);
		const count = getMineCount(
			$cell.data('row'),
			$cell.data('col'),
			);
		return count === 0 ? '' : count;
	});
	$('.col.hiddens').removeClass('hiddens');
	if(!isWin) {
		setTimeout(function() {
			$('#lose-alert').slideDown();
			$('#lose-alert').on('closed.bs.alert', function () {
			  restart();
			});
		}, 300);
	}
	else {
		setTimeout(function() {
			$('#win-alert').slideDown();
			$('#win-alert').on('closed.bs.alert', function () {
			  restart();
			});
		}, 300);
	}
}

function restart() {
	location.reload();
	createBoard(ROWS,COLS); //redundant. don't really need this.
}

restart();