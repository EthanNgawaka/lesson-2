const bg = new image("./assets/imgs/bg/room.png");
const rotate = new image("./assets/imgs/ui/rotate.png");
const intro = new image("./assets/imgs/lex/intro.png");

let score = 0;
let round = 0;
let highScore = 0;
let bgMusicOn = true;
let pool = prompts;
let num_of_rounds = random(3,5,true);
let isEnd = false;
let last_prompt = null;

let shakeTimer = 0;
let lastShake = 0;
let transitionRectW = 0;
let isTransitioned = true;
let transSpeed = 0.1;
let timer = 0;
let display_score = 0;


class Confetti{
	constructor(x,y,theta,speed,prnt, type="conf"){
		this.pos = [x,y];
		this.vel = [Math.cos(theta)*speed, -Math.sin(theta)*speed];
		this.grav = [0,random(0.5,2)*0.2];
		this.drag = 0.97;
		this.parent = prnt;
		this.rot = random(-Math.PI, Math.PI);
		this.dr = random(-Math.PI/90, Math.PI/90);

		this.col = this.rand_col();
		this.rad = random(3,12);
		this.type = type;
	}
	rand_col(){
		let choices = [
			"#a864fd",
			"#29cdff",
			"#78ff44",
			"#ff718d",
			"#fdff6a",
		];
		return choices[random(0,choices.length-1, true)];
	}
	update(){
		this.pos = add(this.pos, this.vel);
		this.vel = add(this.vel, this.grav);
		this.vel = math.multiply(this.vel, this.drag);
		if(this.pos[1] >= windowH + this.rad && this.vel[1] > 0){
			this.parent.del(this);
		}
	}
	draw(){
		if(this.type == "conf"){
			drawCircle(this.pos, this.rad, this.col);
		}else{
			this.img.drawRotatedImg(...this.pos, this.rad*5, this.rad*3, 1, this.rot);
			this.rot += this.dr;
		}
	}
}
class ConfettiManager{
	constructor(){
		this.confetti = [];
		this.toRm = [];
	}
	del(obj){
		this.toRm.push(obj);
	}
	shatter(){
		for(let i = 0; i < 100; i++){
			this.confetti.push( new Confetti(
				windowW/2 + random(-windowW/6, windowW/6),
				windowH/2 + random(-windowH/6, windowH/6),
				random(-Math.PI, Math.PI),
				random(5, 40), this, "shard"
			));
		}
	}
	spawn_confetti_rain(){
		this.confetti.push(new Confetti(
			random(0,windowW), -50, //x, y
			Math.PI/2, // theta
			random(1, 2), this, //speed, parent
		));
	}
	spawn_confetti(){
		this.confetti.push(new Confetti(windowW/2, windowH*1.2, (0.5+random(-0.125,0.125))*Math.PI, random(0,40), this));
	}
	rain(){
		this.spawn_confetti_rain();
	}
	blast(amtn){
		for(let i = 0; i < amtn; i++){
			this.spawn_confetti();
		}
	}
	draw(){
		for(let i of this.confetti){
			i.draw();
		}
	}
	update(){
		for(let i of this.confetti){
			i.update();
		}
		for(let j of this.toRm){
			this.confetti = arrayRemove(this.confetti, j);
		}
		this.toRm = [];
	}
}
conf_man = new ConfettiManager();

//mobile formatting//
function onResize(){
	canvas.style.width = "92.5vw"
	canvas.style.height = "90vh"
	sf[0] = window.innerWidth/windowW;
	sf[1] = window.innerHeight/windowH;
}

function transition(){
	isTransitioned = false;
}

if(window.mobileCheck()){
	document.addEventListener('orientationchange', onResize);
	onResize();
}
//================//

function new_round(do_last_prompt = false){
	transition();
	entities = [];
	if(round == 0){ pool = {...prompts}; }
	timer = 0;

	if(do_last_prompt){
		entities.push(new Round(last_prompt, prompts[last_prompt]));
		return;
	}
	let prompt_keys = Object.keys(pool)
	let index = random(0, prompt_keys.length-1, true);
	let chosen_prompt = prompt_keys[index];
	last_prompt = chosen_prompt;
	entities.push(new Round(chosen_prompt, pool[chosen_prompt]));
	delete pool[chosen_prompt];
	round += 1;
	if(round > num_of_rounds){
		switch_to_end();
	}
}

function switch_to_end(temp=null){
	isEnd = true;
	transition();
	entities = [];
	entities.push(new Button(
		[100,350,300,100],"./assets/imgs/ui/green_button01.png",
		"MENU", "white", switch_to_menu 
	));
	entities.push(new Button(
		[100,500,300,100],"./assets/imgs/ui/yellow_button01.png",
		"TRY AGAIN", "white", switch_to_main 
	));
}

let menu = false;
function switch_to_main(temp=null){
	isEnd = false;
	menu = false;
	transition();
	entities = [];
	round = 0;
	num_of_rounds = random(3,5,true);
	console.log(num_of_rounds);
	new_round();
	timer = 0;
	score = 0;
	display_score = 0;
	conf_man.confetti = [];
}

function unmute(btn){
	bgMusicOn = true;
	btn.img = new image("./assets/imgs/ui/audioOn.png");
	btn.onAction = mute;
}
function mute(btn){
	bgMusicOn = false;
	btn.img = new image("./assets/imgs/ui/audioOff.png");
	btn.onAction = unmute;
}

function switch_to_menu(){
	isEnd = false;
	transition();
	menu = true;
	entities = [];
	// start button
	entities.push(new Button(
		[windowW/2-150,windowH/2+100,300,100],"./assets/imgs/ui/green_button01.png",
		"START", "white", switch_to_main 
	));
	entities.push(new Button(
		[windowW/3-150,windowH/2+100,100,100],
		bgMusicOn ? "./assets/imgs/ui/audioOn.png":"./assets/imgs/ui/audioOff.png",
		"", "white", bgMusicOn ? mute : unmute
	));
	let tag = new Button(
		[windowW/2 - 300,windowH*0.1,600,100],
		"./assets/imgs/ui/tag.png",
		"Kai Vs. Doubtspire", "white", switch_to_main,
		"Orbitron"
	);
	tag.disable = true;
	entities.push(tag);
	conf_man.confetti = [];
}


// this inits the whole thing
switch_to_menu();
//
let lexEnd = new image("./assets/imgs/lex/end.png");
function draw(){
	bg.drawImg(0,0,windowW,windowH, 1);
	if(!menu){
		let num = Math.round(timer);
		drawRect([0,0,windowW*0.2, windowH*0.16],"white");
		showText("TIMER:", windowW*0.1, windowH*0.07, 50)
		showText(String(num).padStart(1,'0')+"s", windowW*0.1, windowH*0.14, 50)

		drawRect([windowW*0.8,0,windowW*0.2, windowH*0.16],"white");
		showText("SCORE: ", windowW*0.9, windowH*0.07, 50)
		showText(String(Math.round(display_score)).padStart(3,'0'), windowW*0.9, windowH*0.14, 50)
		ds = math.abs(display_score - score);
		if(ds > 1){
			display_score = lerp(display_score, score, 0.02);
		}else{
			display_score = score;
		}
	}

	if(menu){
		intro.drawImg(windowW*0.2,windowH*0.2,windowW*0.8,windowH*0.8,1);
		drawCircle([windowW/3-100,windowH/2+150], 50, "white");
	}
	for(let e of entities){
		e.draw();
	}
	if(isEnd){
		lexEnd.drawImg(0,0,windowW,windowH,1);
	}
	conf_man.draw();


	drawRect([0,0,transitionRectW,windowH])
	transitionRectW = lerp(transitionRectW, 0, transSpeed);
}

let rand_vec = [0,0];
function update(dt){
	for(let e of entities){
		e.update(dt);
	}
	shakeTimer -= dt/1000;
	if(shakeTimer > 0){
		if(Math.abs(lastShake - shakeTimer) < 0.1 || lastShake <= 0.1){
			rand_vec = [random(-10,10), random(-20,20)];
			lastShake = shakeTimer;
		}
		Camera.position = lerpArray(Camera.position, add(Camera.position, rand_vec), 1);
	}else{
		Camera.position = lerpArray(Camera.position, [0,0], 0.1);
	}
	conf_man.update();
}

let prev_time = 0
function main(curr_time){
	if(prev_time == 0){ prev_time = curr_time; }
	let dt = curr_time - prev_time;
	prev_time = curr_time;

	if(isTransitioned){
		draw();
		if(isEnd){
			conf_man.spawn_confetti_rain();
		}
		update(dt);
	}else{
		drawRect([0,0,transitionRectW,windowH])
		transitionRectW = lerp(transitionRectW, windowW, transSpeed);
	}
	if(math.abs(transitionRectW - windowW) < 10){
		isTransitioned = true;
		transitionRectW = windowW
	}


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

