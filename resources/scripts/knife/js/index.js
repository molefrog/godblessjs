var preview_mode = true;

$(function() {
	var max_balls = 200;

	var Settings = function() {
		this.friction 		= 0.1;
		this.restitution 	= 0.9;
		this.universal  	= 2000;
		this.time_speed 	= 4.0;
		this.explode_power= 500.0;
		this.balls_count	= 200;

		this.explode 	    = false;

		this.color0 = "#f20072";
		this.color1 = "#d1d953";
	};
  
 	var settings = new Settings();
   
	var explode = (function() {
		var canExplode = true;

		return function () { 
		if(canExplode) {
		  settings.explode = true;
		  canExplode = false;

		  setTimeout(function() {
				  canExplode = true;
			  }, 500);  
		}
		}; 
	})();


	// Creating a drawing context 
	// (using sketch.js helper library).
	var ctx = Sketch.create();
	
	var balls = [];

	var target_x = 0;
	var target_y = 0;
  

	function Ball() {
		this.m   = 1.0;
		this.r   = 1.0;

		this.x   = 0.0;
		this.y 	 = 0.0;
 
		this.v_x = 0.0;
		this.v_y = 0.0;

		this.a_x = 0.0;
		this.a_y = 0.0;
	}


	for(var i = 0; i < max_balls; ++i) {
		var ball = new Ball();

		ball.x = random(0, ctx.width);
		ball.y = random(0, ctx.height);

		ball.r = random(20, 40); 
		ball.m = 0.001 * PI * pow(ball.r, 1.5);

		balls.push(ball);
	}

	  ctx.mousedown = function() {
	    explode();
	  }; 

	ctx.update = function() {
		var dt = ctx.dt ;
		if(dt > 0.05) dt = 0.05;

		dt *= settings.time_speed;

      	if(preview_mode) {
        // random movement from http://codepen.io/soulwire/pen/Ffvlo thanks Justin!
        // http://codepen.io/ferronsays/pen/bjIvA 
        	t = +new Date() * 0.0015;
       		target_x = ctx.width  * 0.5 + ( cos( t * 2.1 ) * cos( t * 0.9 ) * ctx.width * 0.25 );
        	target_y = ctx.height * 0.5 + ( sin( t * 3.2 ) * tan( sin( t * 0.8 ) ) * ctx.height * 0.25);
		}


		for(var i = 0; i < settings.balls_count; ++i) {
			var ball = balls[i];

			var force_x = 0.0;	
			var force_y = 0.0;

			force_x += -settings.friction * ball.v_x;
			force_y += -settings.friction * ball.v_y;

			var r = sqrt(pow(ball.x - target_x, 2) + pow(ball.y - target_y, 2));

			if( r > 10.0 ) {
				if(settings.explode) {
					force_x -= settings.explode_power * (target_x - ball.x) / (r);
					force_y -= settings.explode_power * (target_y - ball.y) / (r);
				} else {
					force_x += settings.universal * (target_x - ball.x) / (r*r);
					force_y += settings.universal * (target_y - ball.y) / (r*r);	
				}
			}

			ball.a_x = force_x / ball.m;
			ball.a_y = force_y / ball.m;

			// Using numerical differentiation to calculate new velocity
			ball.v_x += ball.a_x * dt;
			ball.v_y += ball.a_y * dt;

			// Using this method again to recalculate position
			ball.x += ball.v_x * dt;
			ball.y += ball.v_y * dt;

			// Borders collision
			if(ball.y < ball.r) {
				ball.y = ball.r;
				ball.v_x = ball.v_x;
				ball.v_y = -settings.restitution * ball.v_y;
			}

			if(ball.y > ctx.height - ball.r) {
				ball.y = ctx.height - ball.r
				ball.v_x = ball.v_x;
				ball.v_y = -settings.restitution * ball.v_y;
			}

			if(ball.x < ball.r) {
				ball.x = ball.r;
				ball.v_x = -settings.restitution * ball.v_x;
				ball.v_y = ball.v_y;
			}

			if(ball.x > ctx.width - ball.r) {
				ball.x = ctx.width - ball.r
				ball.v_x = -settings.restitution * ball.v_x;
				ball.v_y = ball.v_y;
			}
		}

		if(settings.explode) {
			settings.explode = false;
		}
	};

	ctx.draw = function() {
		for(var i = 0; i < settings.balls_count; ++i) {
			var ball = balls[i];

			ctx.save();

			var v_r = sqrt(ball.v_x * ball.v_x + ball.v_y * ball.v_y);	
			
			var scale = chroma.scale( [settings.color0, settings.color1]);			
			ctx.fillStyle = scale(v_r / 100).hex();

			ctx.translate(ball.x, ball.y);

			var factor = 1.0 - 0.3 * atan(sqrt(v_r / 20.0)) / HALF_PI;

			ctx.rotate(atan2(ball.v_y, ball.v_x));
			ctx.scale(1.0, factor);

			ctx.beginPath();
			ctx.arc(0.0, 0.0, ball.r, 0, TWO_PI);
			ctx.fill();
			ctx.lineWidth = 0.02;
			ctx.strokeStyle = 'white';
			ctx.stroke();

			ctx.restore();
		}
	};

});
