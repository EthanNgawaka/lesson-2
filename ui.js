class Button{
	constructor(rect, image_path, string, txt_col, onAction, font="Arial"){
		this.rect = rect;
		this.drawing_rect = rect;
		this.img = new image(image_path);
		this.string = string;
		this.col = txt_col;
		this.font = font;
		this.onAction = onAction;

		this.hovered = false;
		this.pressed = true;
		this.disable = false;
	}

	update(dt){
		this.hovered = false;
		if(AABBCollision(this.rect, [mouse.x, mouse.y, 0,0]) && !this.disable){
			if(mouse.button.left && !this.pressed){
				this.onAction(this)
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
		let drawing_rect = [...this.drawing_rect];
		drawing_rect[0] += Camera.position[0];
		drawing_rect[1] += Camera.position[1];
		if(this.hovered){
			drawing_rect = enlargeRect(drawing_rect, 1.05, 1.05);
			if(this.pressed){
				drawing_rect = enlargeRect(drawing_rect, 0.92, 0.92);
			}
		}

		this.img.drawImg(...drawing_rect, 1);
		showText(this.string, this.center[0]+Camera.position[0], this.center[1] + this.rect[3]/7+Camera.position[1], drawing_rect[3]/2, this.col, false, false, this.font);
	}
}
