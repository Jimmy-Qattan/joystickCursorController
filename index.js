const robotjs = require("robotjs")
const three = require("three")

const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const port = new SerialPort('/dev/tty.usbmodem14401', { baudRate: 9600 })
const parser = port.pipe(new Readline({ delimiter: '\n' }))
// Read the port data
port.on("open", () => {
    console.log('serial port open')
})

const { width, height } = robotjs.getScreenSize()

let joyStickX, joyStickY

let fullstring = "";

let working = false;

console.log(width, height);

function inverseLerp(x, y, value) {
    if (x !== y) {
        return (value - x) / (y - x);
    } else {
        return 0;
    }
}

let addX = 0;
let addY = 0;

let xBias = 512 - 505;
let yBias = 512 - 505;

let is1Pressed = false
let is2Pressed = false
const vector = new three.Vector2()
parser.on('data', data => {
    let strings = data.split(',');
    const posX = Number(strings[0]);
    const posY = Number(strings[1]);


    let pressed1 = strings[3] == 1
    if (is1Pressed != pressed1) {
        is1Pressed = pressed1
        if (is1Pressed) {
            console.log("callibrating")
            xBias = 512 - posX;
            yBias = 512 - posY;
        }
    }

    vector.x = three.MathUtils.inverseLerp(0, 1024, (posX + xBias))*2 -1
    vector.y = three.MathUtils.inverseLerp(0, 1024, (posY + yBias))*2 -1

    vector.multiplyScalar(10)
    if (vector.length() > 0.5) {
        let {x, y} = robotjs.getMousePos()
        x += vector.x
        y += vector.y
        robotjs.moveMouse(x, y);
    }

    
    let pressed2 = strings[2] == 1;
    if (is2Pressed != pressed2) {
        is2Pressed = pressed2
        robotjs.mouseToggle(pressed2? "down":"up")
    }

})