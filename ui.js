class Button{
	constructor(rect, image_path, string, txt_col, onAction, font="Arial"){
		this.rect = rect;
		this.img = new image(image_path);
		this.string = string;
		this.col = txt_col;
		this.font = font;
		this.onAction = onAction;

		this.hovered = false;
		this.pressed = false;
	}

	update(dt){
		this.hovered = false;
		if(AABBCollision(this.rect, [mouse.x, mouse.y, 0,0])){
			if(mouse.button.left && !this.pressed){
				this.onAction()
				this.pressed = true;
			}
			this.hovered = true;
		}
		this.pressed = mouse.button.left;
	}

	get center(){
		return [this.rect[0]+this.rect[2]/2, this.rect[1]+this.rect[3]/2];
	}

	draw(){
		let drawing_rect = this.rect;
		if(this.hovered){
			drawing_rect = enlargeRect(drawing_rect, 1.05, 1.05);
			if(this.pressed){
				drawing_rect = enlargeRect(this.rect, 0.95, 0.95);
			}
		}

		this.img.drawImg(...drawing_rect, 1);
		showText(this.string, this.center[0], this.center[1] + this.rect[3]/6, drawing_rect[3]/2, this.col, false, false, this.font);
	}
}
