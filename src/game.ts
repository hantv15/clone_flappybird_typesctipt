export interface Frame {
  firstPipe: PipePair;
  secondPipe: PipePair;
  gameOver: boolean;
  gameStarted: boolean;
  width: number;
  height: number;
  score: number;
  ground: Ground;
  bird: Bird;
}

export interface PipePair {
  topPipe: Pipe;
  bottomPipe: Pipe;
  show: boolean;
  left: number;
  width: number;
}

export interface Pipe {
  top: number;
  height: number;
}

export interface Ground {
  height: number;
}

export interface Bird {
  top: number;
  left: number;
  size: number;
}

export class GameController {
  private frame: Frame;
  private velocity = 0;

  constructor(
    public readonly height = 800,
    public readonly width = 400,
    public readonly pipeWidth = 50,
    public readonly pipeGap = 150,
    public readonly minTopForTopPipe = 70,
    public readonly maxTopForTopPipe = 350,
    public readonly generateNewPipePercent = 0.7,
    public readonly speed = 1,
    public readonly groundHeight = 20,
    public readonly birdX = 40,
    public readonly birdSize = 20,
    public readonly gravity = 1.5,
    public readonly jumVelocity = 10,
    public readonly slowVelocity = 0.3
  ) {}

  public newGame() {
    let firstPipe = this.createPipe(true);
    let secondPipe = this.createPipe(false);

    this.frame = {
      firstPipe,
      secondPipe,
      score: 0,
      width: this.width,
      height: this.height,
      gameOver: false,
      gameStarted: false,
      ground: {
        height: this.groundHeight,
      },
      bird: {
        top: this.height / 2 - this.birdSize / 2,
        size: this.birdSize,
        left: this.birdX,
      },
    };

    return this.frame;
  }

  private randomYForTopPipe(): number {
    return (
      this.minTopForTopPipe +
      (this.maxTopForTopPipe - this.minTopForTopPipe) * Math.random()
    );
  }

  private createPipe(show: boolean): PipePair {
    const height = this.randomYForTopPipe();

    return {
      topPipe: {
        top: 0,
        height,
      },
      bottomPipe: {
        top: height + this.pipeGap,
        height: this.height,
      },
      left: this.width - this.pipeWidth,
      width: this.pipeWidth,
      show,
    };
  }

  private movePipe(pipe: PipePair, otherPipe: PipePair) {
    if (pipe.show && pipe.left <= this.pipeWidth * -1) {
      pipe.show = false;
      return pipe;
    }

    if (pipe.show) {
      pipe.left -= this.speed;
    }

    if (
      otherPipe.left < this.width * (1 - this.generateNewPipePercent) &&
      otherPipe.show &&
      !pipe.show
    ) {
      return this.createPipe(true);
    }

    return pipe;
  }

  public nextFrame() {
    if (this.frame.gameOver || !this.frame.gameStarted) {
      return this.frame;
    }

    // Move Pipes
    this.frame.firstPipe = this.movePipe(
      this.frame.firstPipe,
      this.frame.secondPipe
    );
    this.frame.secondPipe = this.movePipe(
      this.frame.secondPipe,
      this.frame.firstPipe
    );

    // If check bird hit the ground
    if (
      this.frame.bird.top >=
      this.height - this.groundHeight - this.birdSize
    ) {
      this.frame.bird.top = this.height - this.groundHeight - this.birdSize;
      this.frame.gameOver = true;
      return this.frame;
    }
    // End Check if bird hit ground

    // Check if the pipe has collided with the bird
    if (this.hasCollideWithPipe()) {
      this.frame.gameOver = true;
      return this.frame;
    }

    // Add gravity and velocity upward if
    if (this.velocity > 0) {
      this.velocity -= this.slowVelocity;
    }

    // Add score
    if (this.frame.firstPipe.left + this.pipeWidth == this.birdX - this.speed) {
      this.frame.score += 1;
    }

    // Add score
    if (
      this.frame.secondPipe.left + this.pipeWidth ==
      this.birdX - this.speed
    ) {
      this.frame.score += 1;
    }

    this.frame.bird.top += Math.pow(this.gravity, 2) - this.velocity;
    // End gravity and velocity upward if

    return this.frame;
  }

  public jump() {
    if (this.velocity <= 0) {
      this.velocity += this.jumVelocity;
    }
  }

  public start() {
    this.newGame();
    this.frame.gameStarted = true;
    return this.frame;
  }

  private checkPipe(left: number) {
    return (
      left <= this.birdX + this.birdSize && left + this.pipeWidth >= this.birdX
    );
  }

  private hasCollideWithPipe() {
    if (
      this.frame.firstPipe.show &&
      this.checkPipe(this.frame.firstPipe.left)
    ) {
      return !(
        this.frame.bird.top > this.frame.firstPipe.topPipe.height &&
        this.frame.bird.top + this.birdSize <
          this.frame.firstPipe.bottomPipe.top
      );
    }

    if (
      this.frame.secondPipe.show &&
      this.checkPipe(this.frame.secondPipe.left)
    ) {
      return !(
        this.frame.bird.top > this.frame.secondPipe.topPipe.height &&
        this.frame.bird.top + this.birdSize <
          this.frame.secondPipe.bottomPipe.top
      );
    }

    return false;
  }
}
