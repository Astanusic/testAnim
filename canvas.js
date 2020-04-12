const app = new PIXI.Application({
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: "0xffffff",
});
document.body.appendChild(app.view);

//Array to store the graphics
const bouncingCircles = [];
const interactiveCircles = [];

const totalGraphics = app.renderer instanceof PIXI.Renderer ? 800 : 100;
const graphicsColor = ["D78FDC", "47E25C", "F1852B", "EE2F4C", "2FEEEB"];

// That contain the circles anim
const animScene = new PIXI.Container();

//The `randomInt` helper function
const randomInt = (min, max) => {
  return Math.random() * (max - min + 1) + min;
};

// COLLISION FUNCTIONS
const hitTestRectangle = (r1, r2) => {
  //Define the variables we'll need to calculate
  let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

  //hit will determine whether there's a collision
  hit = false;

  //Find the center points of each sprite
  r1.centerX = r1.x + r1.width / 2;
  r1.centerY = r1.y + r1.height / 2;
  r2.centerX = r2.x + r2.width / 2;
  r2.centerY = r2.y + r2.height / 2;

  //Find the half-widths and half-heights of each sprite
  r1.halfWidth = r1.width / 2;
  r1.halfHeight = r1.height / 2;
  r2.halfWidth = r2.width / 2;
  r2.halfHeight = r2.height / 2;

  //Calculate the distance vector between the sprites
  vx = r1.centerX - r2.centerX;
  vy = r1.centerY - r2.centerY;

  //Figure out the combined half-widths and half-heights
  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;

  //Check for a collision on the x axis
  if (Math.abs(vx) < combinedHalfWidths) {
    //A collision might be occurring. Check for a collision on the y axis
    if (Math.abs(vy) < combinedHalfHeights) {
      //There's definitely a collision happening
      hit = true;
    } else {
      //There's no collision on the y axis
      hit = false;
    }
  } else {
    //There's no collision on the x axis
    hit = false;
  }

  //`hit` will be either `true` or `false`
  return hit;
};
const contain = (sprite, container) => {
  let collision = undefined;

  //Left
  if (sprite.x < container.x) {
    sprite.x = container.x;
    collision = "left";
  }

  //Top
  if (sprite.y < container.y) {
    sprite.y = container.y;
    collision = "top";
  }

  //Right
  if (sprite.x + sprite.width > container.width) {
    sprite.x = container.width - sprite.width;
    collision = "right";
  }

  //Bottom
  if (sprite.y + sprite.height > container.height) {
    sprite.y = container.height - sprite.height;
    collision = "bottom";
  }

  //Return the `collision` value
  return collision;
};

const popEveryBouncingParticles = () => {
  bouncingCircles.forEach((circle) => {
    setTimeout(() => {
      gsap.to(
        circle,
        0.3,
        {
          pixi: {
            scale: 3,
            alpha: 0,
          },
        },
        0
      );
    }, 15000);
  });
};
const popEveryInteractiveParticles = () => {
  interactiveCircles.forEach((circle) => {
    setTimeout(() => {
      gsap.to(
        circle,
        0.3,
        {
          pixi: {
            scale: 3,
            alpha: 0,
          },
        },
        0
      );
    }, 15700);
  });
};

//INIT INTERACTIVE CIRCLES CONTAINER ON APP SCENE
const initInteractiveCircles = () => {
  for (let i = 0; i < totalGraphics / 2; i++) {
    const circle = new PIXI.Graphics();
    circle.beginFill(
      `0x${graphicsColor[Math.floor(Math.random() * graphicsColor.length)]}`
    );
    circle.lineStyle(0); // draw a circle, set the lineStyle to zero so the circle doesn't have an outline
    circle.drawCircle(0, 0, 10);

    const circleTex = app.renderer.generateTexture(circle);

    const spriteCircle = new PIXI.Sprite.from(circleTex);
    let x = randomInt(0, app.screen.width - spriteCircle.width);
    let y = randomInt(0, app.screen.height - spriteCircle.height);
    spriteCircle.x = x;
    spriteCircle.y = y;
    spriteCircle.scale.set(Math.random());
    spriteCircle.alpha = Math.random();
    spriteCircle.vx = randomInt(-0.3, 0.3);
    spriteCircle.vy = randomInt(-0.3, 0.3);

    spriteCircle.interactive = true; // enable mouse and touch events
    spriteCircle.buttonMode = true;

    // Poping half ot the particles

    const popParticle = () => {
      gsap.to(
        spriteCircle,
        0.3,
        {
          pixi: {
            scale: 3,
            alpha: 0,
          },
        },
        0
      );
    };

    spriteCircle.mouseover = function (e) {
      popParticle();
    };
    popEveryInteractiveParticles();

    interactiveCircles.push(spriteCircle);
    animScene.addChild(spriteCircle);
    app.stage.addChild(animScene);
  }
};
initInteractiveCircles();

const movingInteractiveCirclesRandomly = () => {
  interactiveCircles.forEach((circle) => {
    if (circle.vx === 0 || circle.vy === 0) {
      if (circle.vx === 0) {
        circle.vx = randomInt(-0.5, 0.5);
      }
      if (circle.vy === 0) {
        circle.vy = randomInt(-0.5, 0.5);
      }
    }
    circle.y += circle.vy;
    circle.x += circle.vx;

    let circleHitWalls = contain(circle, {
      x: 0,
      y: 0,
      width: app.screen.width,
      height: app.screen.height,
    });

    if (circleHitWalls === "top" || circleHitWalls === "bottom") {
      circle.vy *= -1;
    }
    if (circleHitWalls === "right" || circleHitWalls === "left") {
      circle.vx *= -1;
    }
  });
};

//INIT BOUNCING CIRCLES CONTAINER  ON APP SCENE
const initBouncingCircles = () => {
  for (let i = 0; i < totalGraphics / 2; i++) {
    // create new Sprite
    const circle = new PIXI.Graphics();
    // Circle
    circle.beginFill(
      `0x${graphicsColor[Math.floor(Math.random() * graphicsColor.length)]}`
    );
    circle.lineStyle(0); // draw a circle, set the lineStyle to zero so the circle doesn't have an outline
    circle.drawCircle(0, 0, 10);

    const circleTex = app.renderer.generateTexture(circle);

    const spriteCircle = new PIXI.Sprite.from(circleTex);

    let x = randomInt(0, app.screen.width - spriteCircle.width);
    let y = randomInt(0, app.screen.height - spriteCircle.height);

    spriteCircle.x = x;
    spriteCircle.y = y;

    spriteCircle.scale.set(Math.random());
    spriteCircle.alpha = Math.random();

    spriteCircle.vx = randomInt(-0.3, 0.3);
    spriteCircle.vy = randomInt(-0.3, 0.3);

    popEveryBouncingParticles();

    bouncingCircles.push(spriteCircle);
    animScene.addChild(spriteCircle);
    app.stage.addChild(animScene);
  }

  const dudeBoundsPadding = 0;
  const circleBounds = new PIXI.Rectangle(
    0,
    0,
    app.screen.width,
    app.screen.height
  );
};
initBouncingCircles();

//MECHANICS FUNC THAT HELP CHECKING COLLISIONS BETWEEN EACH CIRCLE AND WALL TO MAKE THEM BOUNCE
const movingBouncingCirclesRandomly = () => {
  bouncingCircles.forEach((circle) => {
    if (circle.vx === 0 || circle.vy === 0) {
      if (circle.vx === 0) {
        circle.vx = randomInt(-0.3, 0.3);
      }
      if (circle.vy === 0) {
        circle.vy = randomInt(-0.3, 0.3);
      }
    }
    circle.y += circle.vy;
    circle.x += circle.vx;

    let circleHitWalls = contain(circle, {
      x: 0,
      y: 0,
      width: app.screen.width,
      height: app.screen.height,
    });

    if (circleHitWalls === "top" || circleHitWalls === "bottom") {
      circle.vy *= -1;
    }
    if (circleHitWalls === "right" || circleHitWalls === "left") {
      circle.vx *= -1;
    }
  });
};

//APP TICKER, CALLED EACH FRAME/s (usually 60 times each seconds)
app.ticker.add((delta) => {
  movingBouncingCirclesRandomly();
  movingInteractiveCirclesRandomly();
});
