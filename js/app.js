class LettertracingAdmin {
	constructor() {

		this.groups = [];
		this.currentletter = null;

		this.result = document.getElementsByClassName('result')[0];
		this.letter_view = document.getElementById('letter_view');
		this.letter_inner = document.getElementsByClassName('letter_view_inner')[0];
		this.letter_hotspots = document.getElementsByClassName('letter_hotspots')[0];
		this.new_group = document.getElementsByClassName('new_group')[0];
		this.groups_right_side = document.getElementsByClassName('groups')[0];
		this.export = document.getElementsByClassName('export')[0];

		this.selectedSpots = $([])
		this.spotsOffset = {top: 0, left: 0};

		this.letter_canvas = document.getElementById('letter_canvas');
		this.letter_canvas_ctx = this.letter_canvas.getContext('2d');
	}

	initLetterCanvas() {

        var scaledFontsize = $(this.letter_canvas).width() * 0.8;

        console.log('scaledFontsize',scaledFontsize);

        this.letter_canvas_ctx.font = 'normal ' + scaledFontsize + 'px Lara';

        var textWidth = this.letter_canvas_ctx.measureText(this.currentletter.toLowerCase()).width;
        
        this.letter_canvas_ctx.textBaseline = 'middle';

        this.letter_canvas_ctx.fillText(this.currentletter.toLowerCase(), (this.letter_canvas.width/2) - (textWidth / 2), (this.letter_canvas.height/2.5));
    }

	openLetter(target) {

		const laraFont = new FontFace('Lara', 'url(fonts/lara.otf)');

        laraFont.load().then((font) => {
            document.fonts.add(font);

            var letter = target.textContent;  
	        this.currentletter = letter;
	        this.letter_view.style.display = 'block';
	        this.setDimension();
	        this.initLetterCanvas();
			this.renderGroupsRightSide();
        });
	}

	renderGroupsRightSide() {
		var html = '';
		for (var i = 0; i < this.groups.length; i++) {
			html += '<div class="group">';
			html += '<h3>Grupp: '+i+'</h3>';
				for (var ii = 0; ii < this.groups[i].spots.length; ii++) {
					if (this.groups[i].spots[ii] === 'spot') {
						html += '<div class="spot">' + i + ':' + ii + '</div>';
					}
				}
				html += '<button class="new_spot">Skapa hotspot</button>';
			html += '</div>';
		}
		this.groups_right_side.innerHTML = html;
	}

	addHotspot(groupindex,spotindex) {
		$(this.letter_hotspots).append('<li data-index="' + groupindex + ':' + spotindex + '" class="spot">' + groupindex + ':' + spotindex + '</li>');
		this.setDraggable();
	}

	setDimension() {
		var wrapperHeight = Math.max(window.innerHeight, document.documentElement.clientHeight);

		$(this.letter_view).find('.letter').css({'width':(wrapperHeight) * (16/9) + 'px','height':wrapperHeight + 'px'});

		this.letter_inner.style.width = ((wrapperHeight) * (16/9)) + 'px';
        this.letter_inner.style.height = wrapperHeight + 'px';

        this.letter_canvas.width = ((wrapperHeight) * (16/9));
        this.letter_canvas.height = wrapperHeight;
	}   

	exportHotspots() {
		var that = this;

		var container_width = this.letter_canvas.width;
		var container_height = this.letter_canvas.height;

		console.log('container_width',container_width);
		console.log('container_height',container_height);

		var hotspots = $(this.letter_hotspots).find('li');

		var groups = [];

		var iteration = 0;
		$(hotspots).each( function(i,item) {
			var index_parts = $(item).data('index').split(':');
			var x = $(item).offset().left +10;
			var y = $(item).offset().top +10;
			
			if (!groups[index_parts[0]]) {
				iteration = 0;
				groups[index_parts[0]] = [];
			}
			groups[index_parts[0]].push({index:iteration,x:that.percentageOf(x,container_width),y:that.percentageOf(y,container_height)});
			iteration++;
		});

		this.result.innerHTML = '<pre>'+JSON.stringify(groups, undefined, 4)+'</pre>';
		this.result.style.display = 'block';

		/*
		fetch('/saveLetter', {
		  method: 'post',
		  headers: {
		    'Accept': 'application/json',
      		'Content-Type': 'application/json'
		  },
		  body: JSON.stringify(groups)
		}).then(checkStatus)
    	.then(()=>console.log('updated!!!'));
    	*/

	}

	percentageOf(x,length) {
		console.log(x,length);
		return parseFloat((x/length)*100).toFixed(4);
	}

	setDraggable() {
		$(this.letter_hotspots).find('li').draggable({
			snap : false,
			containment: '#letter_view .letter_view_inner',
			start: function () {
				
			},
			drag: function (event, ui) {
				
			}
		});
	}

	init() {
		var that = this;

        document.getElementById('alphabet').addEventListener('click', function(e){
            that.openLetter(e.target);
        });

        this.setDimension();

        this.setDraggable();
        
		$(this.letter_hotspots).find('li').click(function() {
		    if (!$(this).hasClass("ui-selected")) {
		        $(this).addClass("ui-selected").siblings().removeClass("ui-selected");
		    }
		});
		$(this.new_group).click( function(event) {
			that.groups.push({spots:[]});
			that.renderGroupsRightSide();
		});
		$(this.groups_right_side).on('click','.new_spot', function(event) {
			var parent = $( event.target ).parent();
			var group_i = $(parent).index();
			that.groups[group_i].spots.push('spot');
			that.addHotspot(group_i,that.groups[group_i].spots.length-1);
			that.renderGroupsRightSide();
		});
		$(this.letter_view).on('click','.spot', function(event) {
			var text = event.target.textContent;
			var exploded = text.split(':');

			$(that.letter_view).find('[data-index="' + text + '"]').remove()
			
			for (var i = 0; i < that.groups.length; i++) {
				if (i === parseInt(exploded[0])) {
					for (var ii = 0; ii < that.groups[i].spots.length; ii++) {
						if (ii === parseInt(exploded[1])) {
							that.groups[i].spots[ii] = 'removed';
						}
					}
				}
			}

			that.renderGroupsRightSide();
		});
		$(this.export).click( function(event) {
			that.exportHotspots();
		});
	}
}

let lettertracingAdmin = new LettertracingAdmin();

window.onload = function() {
    lettertracingAdmin.init();
}
