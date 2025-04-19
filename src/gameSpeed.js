class GameSpeed {
    static SLOW = 'SLOW';
    static NORMAL = 'NORMAL';
    static FAST = 'FAST';

    static objectsSpeed(speed) {
        switch (speed) {
            case GameSpeed.SLOW:
                return 150;
            case GameSpeed.NORMAL:
                return 300;
            case GameSpeed.FAST:
                return 450;
            default:
                return 300;
        }
    }

    static backgroundSpeed(speed) {
        switch (speed) {
            case GameSpeed.SLOW:
                return 50;
            case GameSpeed.NORMAL:
                return 100;
            case GameSpeed.FAST:
                return 200;
            default:
                return 100;
        }
    }

    static playerFPS(speed) {
        switch (speed) {
            case GameSpeed.SLOW:
                return 4;
            case GameSpeed.NORMAL:
                return 8;
            case GameSpeed.FAST:
                return 12;
            default:
                return 8;
        }
    }

    static rockPeriod(speed) {
        switch (speed) {
            case GameSpeed.SLOW:
                return 1000;
            case GameSpeed.NORMAL:
                return 500;
            case GameSpeed.FAST:
                return 250;
            default:
                return 500;
        }
    }

    static pipePeriod(speed) {
        switch(speed) {
            case GameSpeed.SLOW:
                return 3000; // Slower oscillation when game is slow
            case GameSpeed.FAST:
                return 1000; // Faster oscillation when game is fast
            default:
                return 2000; // Normal oscillation speed
        }
    }
}

export default GameSpeed;