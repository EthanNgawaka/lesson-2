function getTextWidth(text, fontSize, fontFamily) {
    c.font = `${fontSize}px ${fontFamily}`;
    return c.measureText(text).width;
}

class Round{
	constructor(prompt, options){
		this.toggle = true;
		let h = windowH;
		this.doubtRectFinal = [windowW*0.05, windowH*0.2, h*0.57143, h];
		this.doubtRect = [...this.doubtRectFinal];
		this.doubtRect[1] = windowH;
		this.finalTextSize = 40;
		this.g = 1;
		this.textSize = 0;
		this.prompt = prompt;
		this.correct_option = options[0];
		this.options = [...options];
		this.doubtspire = new image("./assets/imgs/doubtspire/badguy.png");
		shuffle(this.options)

		this.lex = new image("./assets/imgs/lex/dontgiveup.png");
		this.lexRect = [windowW*0.1, windowH, windowW*0.5, windowW*0.5*0.77];
		this.lexRectFinalY = windowH*0.4;

		this.lexs = new image("./assets/imgs/lex/congrats.png");
		this.lexsRect = [windowW*0.1, windowH, windowW*0.5, windowW*0.5*0.77];
		this.lexsRectFinalY = windowH*0.4;

		this.textBubble = new image("./assets/imgs/ui/button.png");
		let actualTxtW = getTextWidth(this.prompt, this.finalTextSize, "Arial");
		let txtw = actualTxtW + windowW*0.1;
		let txth = windowH*0.2;
		this.textBubbleRectFinal = [windowW/2, windowH*0.12,txtw,txth];
		this.textBubbleRect = [...this.textBubbleRectFinal];
		this.textBubbleRect[2] = 0;
		this.textBubbleRect[3] = 0;
		this.failed = false;
		this.failedTimer = 0

		this.yet = new image("./assets/imgs/kai/yet.png");
		let yw = windowW*0.4;
		this.yetRect = [windowW*0.7, windowH, yw*0.5622, yw];
		this.yetRectY = windowH*0.15;
		this.yetRectX = -windowW;
		this.yetRectRot = 0;

		this.shards = [];
		this.animation = 0;
		this.animationMax = 12;

		let font = "Arial"

		this.shattered = false;

		for(let i = 0; i < this.options.length; i++){
			let h = windowH*0.1;
			let w = getTextWidth(this.options[i], h/2, font)+windowW*0.05;
			let x = windowW*0.6 - w/2;
			let y = 3*h + i*3*h/2
			let onAction = this.correct_option == this.options[i] ? this.correct : this.wrong;
			entities.push(new Button(
				[x,y,w,h],"./assets/imgs/ui/scoreboard.png",
				this.options[i], "black", onAction,
				font,
			));
		}
	}
	shatter(){
		if(!this.shattered){
			sfx.hammer1.play();
			let w = 768;
			let h = 1344;
			let shards = []; // shard = {pos:[x,y], rot:0, vel:[x,y], frect:[x,y,w,h]}
			let num = 15;
			let dw = w/num;
			let dh = h/num;
			let actualDw = this.doubtRect[2]/num;
			let actualDh = this.doubtRect[3]/num;
			for(let i = 0; i < num; i++){
				for(let j = 0; j < num; j++){
					let tempx = this.doubtRect[0]+actualDw*i
					let tempy = this.doubtRect[1]+actualDh*j;
					let theta = random(-Math.PI, 0);
					let mag = random(20, 50);
					let tempVel = [math.cos(theta)*mag, mag*math.sin(theta)]
					let new_shard = {pos:[tempx,tempy],rot:theta+random(-Math.PI/6,Math.PI/6), vel:tempVel, frect:[dw*i,dh*j,dw,dh], dr:random(0,Math.PI/6), wh:[actualDw, actualDh]};
					shards.push(new_shard);
				}
			}
			this.shards = shards;
		}
	}
	correct(bttn){
		get_entity_by_type(Round)[0].animation = get_entity_by_type(Round)[0].animationMax;
		for(let btn of get_entity_by_type(Button)){
			btn.disable = true;
		}
		score += 100;
		if(timer < 15){
			console.log(timer)
			score += 50;
		}
		sfx.pop.play()
		conf_man.blast(100)
	}
	wrong(bttn){
		sfx.fail.play()
		shakeTimer = 0.5;
		for(let btn of get_entity_by_type(Button)){
			btn.disable = true;
		}
		get_entity_by_type(Round)[0].prompt = "You'll never defeat me!";
		get_entity_by_type(Round)[0].failed = true;
		let b = windowH*0.2;
		entities.push(new Button(
			[windowW*0.7 - b/2,windowH*0.7 ,b,b],"./assets/imgs/ui/retry.png",
			"", "black", function(){new_round(true)},
			"Arial",
		));
	}
	update(dt){
		if(this.failed){
			this.failedTimer -= dt/1000;
			return;
		}
		if(this.animation > 0){
			this.animation -= dt/1000;
			if(this.animation <= 0){
				new_round();
			}
			let rm = []
			for(let s of this.shards){
				s.pos[0] += s.vel[0];
				s.pos[1] += s.vel[1];
				s.vel[1] += 1; // gravity
				if(s.pos[1] > windowH && !AABBCollision([...s.pos,...s.wh], [0,0,windowW,windowH])){
					rm.push(s);
				}
			}
			for(let r of rm){
				this.shards = arrayRemove(this.shards, r);
			}
			return;
		}
		timer += dt/1000
	}
	draw(){

		let centerRect = [...this.textBubbleRect];
		centerRect[0] -= centerRect[2]/2-Camera.position[0];
		centerRect[1] -= centerRect[3]/2-Camera.position[1];
		let f = 0.125*math.sin(this.failedTimer*Math.PI) + 1;
		let f2 = 0.125*math.sin(this.failedTimer*Math.PI - Math.PI/3) + 1;
		let f3 = 0.06*math.sin(this.failedTimer*Math.PI/2) + 1;
		centerRect = enlargeRect(centerRect, f2, f2);
		if(f != 1){
			this.textSize = this.finalTextSize*f
		}
		this.textBubble.drawImg(...centerRect, 1);
		let s = 1
		if(f != 1){
			s = 0.125*math.sin(this.failedTimer*Math.PI/7) + 1.125;
		}
		if(!this.shattered){
			this.doubtspire.drawImg(...enlargeRect(this.doubtRect,s,s), 1);
		}
		if(this.failedTimer < -3){
			for(e of get_entity_by_type(Button)){
				if(e.string == ""){
					e.drawing_rect = enlargeRect(e.rect,f3,f3);
					break;
				}
			}
			this.lex.drawImg(...this.lexRect, 1);
			this.lexRect[1] = lerp(this.lexRect[1], this.lexRectFinalY, 0.1)
			if(this.toggle){
				this.toggle = false;
				sfx.woosh.play();
			}
		}
		showText(this.prompt, this.textBubbleRect[0]+Camera.position[0], this.textBubbleRect[1]+Camera.position[1], this.textSize, "black")

		this.doubtRect[1] = lerp(this.doubtRect[1], this.doubtRectFinal[1], 0.1);
		this.textBubbleRect[2] = lerp(this.textBubbleRect[2], this.textBubbleRectFinal[2], 0.05);
		this.textBubbleRect[3] = lerp(this.textBubbleRect[3], this.textBubbleRectFinal[3], 0.05);
		this.textSize = lerp(this.textSize, this.finalTextSize, 0.05);

		if(this.animation > 0){
			for(e of get_entity_by_type(Button)){
				if(e.string == this.correct_option){
					this.g = lerp(this.g,0.3+0.125*math.sin((this.animationMax-this.animation)*Math.PI) + 1, 0.1);
					e.drawing_rect = enlargeRect(e.rect,this.g,this.g);
					break;
				}
			}
			if(this.animation > this.animationMax-5){
				this.yetRect[1] = lerp(this.yetRect[1], this.yetRectY, 0.01);
			}else{
				this.yetRectRot -= Math.PI/12;
				this.yetRect[0] = lerp(this.yetRect[0], this.yetRectX, 0.02);
			}
			if(this.yetRect[0] < windowW*0.15){
				this.shatter();
				this.shattered = true;
				for(let s of this.shards){
					this.doubtspire.drawFragment(...s.pos, s.wh[0],s.wh[1],...s.frect, s.rot);
				}
			}
			if(this.animation < 5){
				this.lexs.drawImg(...this.lexsRect, 1);
				this.lexsRect[1] = lerp(this.lexsRect[1], this.lexsRectFinalY, 0.1)
				if(this.toggle){
					sfx.woosh.play();
					this.toggle = false;
				}
			}
			this.yet.drawRotatedImg(...this.yetRect, 1, this.yetRectRot);
		}
	}
}

prompts = {
    "You’ll never pass that test.": [
        "I can study and improve one step at a time.",
        "It’s too hard; I’ll just give up now.",
        "I’ll never be good enough."
    ],
    "You’ll never finish your homework.": [
        "I can take it one question at a time.",
        "There’s too much to do; I won’t even start.",
        "I’ll just skip it."
    ],
    "You’ll never make any friends.": [
        "I just need to be friendly and kind.",
        "Nobody likes me.",
        "It’s not worth trying."
    ],
    "You’re bad at sports.": [
        "I’ll improve with practice.",
        "I’ll always be bad at it.",
        "There’s no point in trying."
    ],
    "You’ll never be able to draw well.": [
        "I can keep practicing to get better.",
        "My drawings will always be bad.",
        "Why even bother?"
    ],
    "There’s no point in trying.": [
        "Trying my best is what matters.",
        "I’ll never succeed.",
        "Only winners matter."
    ],
    "You’ll never remember your lines for the play.": [
        "I can practice a little every day.",
        "I’ll mess it up anyway.",
        "It’s too much to remember."
    ],
    "You’re always messing things up.": [
        "Mistakes are part of learning.",
        "I’ll never get it right.",
        "I ruin everything."
    ],
    "You’re not smart enough to solve this.": [
        "I can learn if I try hard.",
        "This is too difficult for me.",
        "I’m just not smart."
    ],
    "You can’t learn a new skill.": [
        "Every skill takes practice.",
        "Some people are just born good at it.",
        "I’ll never be able to do it."
    ]
}
