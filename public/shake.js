var Shaking= class Shaking{

    constructor(){
        this.shakeDetect();
    }

    shakeDetect(){
        var alertornot = false;
        if(document.getElementById("alertShake"))
            alertornot = true;
        else 
            alertornot = false;
        
        var x,y,z;
        var lastX,lastY,lastZ,
            lastShake = new Date().getTime(),
            threshold = 10;
        var shake = 0;

        if (!('ondevicemotion' in window)) {
            alert('DeviceMotionEvent not support');
            document.getElementById("test").innerHTML = "why";
        } else {
            window.addEventListener('devicemotion', function(event) {
                x = Math.round(event.accelerationIncludingGravity.x);
                y = Math.round(event.accelerationIncludingGravity.y);
                z = Math.round(event.accelerationIncludingGravity.z);
                if(document.getElementById("XYZ"))
                    document.getElementById("XYZ").innerHTML = "x:"+x+"<br>"+
                                                            "y:"+y+"<br>"+
                                                            "z:"+z;

                if(lastX !== null && lastY !== null && lastZ !== null){
                    //Get the distance moved
                    var diffX = Math.abs(x-lastX);
                    var diffY = Math.abs(y-lastY);
                    var diffZ = Math.abs(z-lastZ);
                    if(document.getElementById("differXYZ"))
                        document.getElementById("differXYZ").innerHTML = "diff-X:"+diffX+"<br>"+
                                                                "diff-Y:"+diffY+"<br>"+
                                                                "diff-Z:"+diffZ;
                }
                lastX = x;
                lastY = y;
                lastZ = z;

                //shake detection code will go here
                if(diffX > threshold && diffY > threshold ||
                    diffX > threshold && diffZ > threshold ||
                    diffY > threshold && diffZ > threshold){
                    var now = new Date().getTime();
                    var diffTime = now - lastShake;
                    if(diffTime > 500){
                        shake++;
                        if(document.getElementById("shakeCount"))
                            document.getElementById("shakeCount").innerHTML = shake;
                        
                            var $username = $loginForm.find('input[name=username]');
                            // alert($username.val());
                            // alert(shake.toString());
 
                            socket.emit('message', {
                                username: $.trim($username.val()),
                                text: shake.toString()
                            });

                        if(alertornot)
                            alert("Shaked!");
                        lastShake = now;
                    }
                }
            });
        }
    }
}
