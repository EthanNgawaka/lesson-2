const bg = new image("./assets/imgs/bg/room.png");
const rotate = new image("./assets/imgs/ui/rotate.png");

let score = 0;
let highScore = 0;
let bgMusicOn = true;

//mobile formatting//
function onResize(){
	canvas.style.width = "92.5vw"
	canvas.style.height = "90vh"
	sf[0] = window.innerWidth/windowW;
	sf[1] = window.innerHeight/windowH;
}

if(window.mobileCheck()){
	document.addEventListener('orientationchange', onResize);
	onResize();
}
//================//


function switch_to_main(){
	entities = [];
	console.log('starting game!')
}

function switch_to_menu(){
	entities = [];
	entities.push(new Button(
		[100,100,300,100],"./assets/imgs/ui/green_button01.png",
		"START", "white", switch_to_main 
	));
}


// this inits the whole thing
switch_to_menu();
//
function draw(){
	bg.drawImg(0,0,windowW,windowH, 1);

	for(let e of entities){
		e.draw();
	}
}
function update(dt){
	for(let e of entities){
		e.update(dt);
	}
}

let prev_time = 0
function main(curr_time){
	if(prev_time == 0){ prev_time = curr_time; }
	let dt = curr_time - prev_time;
	prev_time = curr_time;

	draw();
	update(dt);


	oldKeys = {...keys};
	if(window.mobileCheck()){
		onResize();
	}
	if(window.innerHeight > window.innerWidth){
		rotate.drawImg(windowW/2 - 150/sf[0],windowH/2 - 150/sf[1],300/sf[0],300/sf[1],1);
	}
	if(bgMusicOn){
		sfx.bg_music.volume(0.3);
	}else{
		sfx.bg_music.volume(0);
	}
	requestAnimationFrame(main);
}

requestAnimationFrame(main);

