// modified from http://randomnerdtutorials.com/programming-the-beaglebone-black-with-bonescript/
//Loading modules
var http = require('http');
var fs = require('fs');
var path = require('path');
var b = require('bonescript');

// Create a variable called led, which refers to P9_14
// use on board LEDs
var leds = ["USR0", "USR1", "USR2", "USR3"];
var leds = ["P8_7", "P8_9", "P8_8", "P8_10"];
// Initialize the led as an OUTPUT

for(var i = 0; i < leds.length; i++) {
b.pinMode(leds[i], b.OUTPUT);
}

// Initialize the server on port 8888
var server = http.createServer(function (req, res) {
    // requesting files
    var file = '.'+((req.url=='/')?'/index.html':req.url);
    var fileExtension = path.extname(file);
    var contentType = 'text/html';
    // Uncoment if you want to add css to your web page
    /*
    if(fileExtension == '.css'){
        contentType = 'text/css';
    }*/
    fs.exists(file, function(exists){
        if(exists){
            fs.readFile(file, function(error, content){
                if(!error){
                    // Page found, write content
                    res.writeHead(200,{'content-type':contentType});
                    res.end(content);
                }
            })
        }
        else{
            // Page not found
            res.writeHead(404);
            res.end('Page not found');
        }
    })
}).listen(8888);

// Loading socket io module
var io = require('socket.io').listen(server);

// When communication is established
io.on('connection', function (socket) {
    socket.on('changeState', handleChangeState);
});

// Change led state when a button is pressed
function handleChangeState(data) {
    var newData = JSON.parse(data);
    console.log("LED = 1");
    // turns the LED ON or OFF
    if (newData.duration > 0) {
        setValveState(newData.valvenum, 1);
        setTimeout(timerExpiredCallback, Number(newData.duration)*1000, newData.valvenum);
    }
    else {
       setValveState(newData.valvenum, 0);
       console.log("LED = 0");
    }
}

function timerExpiredCallback(valvenum) {
    console.log("LED = 0");
    setValveState(valvenum, 0);
}

// changes the digital IO line and updates the UI
function setValveState(valvenum, state) {
    b.digitalWrite(leds[valvenum], state);
    // send message to all sockets what the state is
    io.sockets.emit('updateStatus', '{"valvenum":' + valvenum + ',"state":' + state + '}');
}

// Displaying a console message for user feedback
server.listen(console.log("Server Running ..."));

