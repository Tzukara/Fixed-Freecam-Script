    import * as alt from 'alt';
    import * as native from 'natives';



    let freecam = {
        active   : false,
        camera   : null,
        interval : null,
        webView  : new alt.WebView("http://resource/webui/index.html"),
        actions  : {
            moveF   : false,
            moveB   : false,
            moveL   : false,
            moveR   : false,
            moveU   : false,
            moveD   : false,
            rotU    : false,
            rotD    : false,
            rotL    : false,
            rotR    : false
        },
        speed  : {
            move : 4.00,
            turn : 1.50
        },
        start  : function()
        {
            if( freecam.active )
                return;

            freecam.active = true;

            var camPos = native.getGameplayCamCoord();
            var camRot = native.getGameplayCamRot(2);

            freecam.camera = native.createCamWithParams("DEFAULT_SCRIPTED_CAMERA", camPos.x, camPos.y, camPos.z, camRot.x, camRot.y, camRot.z, 60, true, 2);
            native.setCamActive(freecam.camera, true);
            native.renderScriptCams(true, false, 0, false, false, 0);

            alt.toggleGameControls(false);

            // show webView
            freecam.webView.isVisible = true;
            freecam.webView.focus();

            // show cursor
            alt.showCursor(true);

            freecam.interval = alt.setInterval( function()
            {
                executeActions();
            }, 10)
        },
        stop   : function()
        {
            if (!freecam.active )
                return;

            native.renderScriptCams(false, false, 0, true, false, 1);
            native.destroyCam(freecam.camera, true);
            native.setFollowPedCamViewMode(1);
            native.clearFocus();

            alt.clearInterval(freecam.interval);
            freecam.interval = null;
            freecam.active = false;

            alt.toggleGameControls(true);

            // hide webView
            freecam.webView.isVisible = false;
            freecam.webView.unfocus();

            // show cursor
            alt.showCursor(false);
        }
    }

    alt.setTimeout(() => {
        freecam.webView.isVisible = false;
    }, 500);



    function executeActions()
    {

        let camPos = {...native.getCamCoord(freecam.camera)};
        let camRot = {...native.getCamRot(freecam.camera, 2)};


        var updatePos = false;
        var updateRot = false;

        if( freecam.actions.moveF )
        {
            let camDir = calcCameraDirectionForward(camRot);

            camPos.x = camPos.x + ( camDir.x * freecam.speed.move );
            camPos.y = camPos.y + ( camDir.y * freecam.speed.move );
            camPos.z = camPos.z + ( camDir.z * freecam.speed.move );
            updatePos = true;
        }

        if( freecam.actions.moveB )
        {
            let camDir = calcCameraDirectionForward(camRot);

            camPos.x = camPos.x - ( camDir.x * freecam.speed.move );
            camPos.y = camPos.y - ( camDir.y * freecam.speed.move );
            camPos.z = camPos.z - ( camDir.z * freecam.speed.move );
            updatePos = true;
        }

        if( freecam.actions.moveR )
        {
            let camDir = calcCameraDirectionRight(camRot);

            camPos.x = camPos.x + ( camDir.x * freecam.speed.move );
            camPos.y = camPos.y + ( camDir.y * freecam.speed.move );
            camPos.z = camPos.z;
            updatePos = true;
        }

        if( freecam.actions.moveL )
        {
            let camDir = calcCameraDirectionRight(camRot);

            camPos.x = camPos.x - ( camDir.x * freecam.speed.move );
            camPos.y = camPos.y - ( camDir.y * freecam.speed.move );
            camPos.z = camPos.z;
            updatePos = true;
        }

        if( freecam.actions.moveU )
        {
            camPos.z = ( camPos.z * 1 ) + ( freecam.speed.move );
            updatePos = true;
        }

        if( freecam.actions.moveD )
        {
            camPos.z = ( camPos.z * 1 ) - ( freecam.speed.move );
            updatePos = true;
        }

        if( freecam.actions.rotR )
        {
            camRot.z = ( camRot.z * 1 ) - ( freecam.speed.turn );
            updateRot = true;
        }

        if( freecam.actions.rotL )
        {
            camRot.z = ( camRot.z * 1 ) + ( freecam.speed.turn );
            updateRot = true;
        }

        if( freecam.actions.rotU )
        {
            camRot.x = ( camRot.x * 1 ) + ( freecam.speed.turn );
            updateRot = true;
        }

        if( freecam.actions.rotD )
        {
            camRot.x = ( camRot.x * 1 ) - ( freecam.speed.turn );
            updateRot = true;
        }

        if( updatePos )
        {
            native.setCamCoord(
                freecam.camera,
                camPos.x,
                camPos.y,
                camPos.z
            );

            freecam.webView.emit('Position:SetX', camPos.x);
            freecam.webView.emit('Position:SetY', camPos.y);
            freecam.webView.emit('Position:SetZ', camPos.z);
        }

        if( updateRot )
        {
            native.setCamRot(
                freecam.camera,
                camRot.x,
                camRot.y,
                camRot.z,
                2
            );

            freecam.webView.emit('Rotation:SetX', camRot.x);
            freecam.webView.emit('Rotation:SetY', camRot.y);
            freecam.webView.emit('Rotation:SetZ', camRot.z);
        }
    }


    freecam.webView.on("Speed:DecreaseMoveSpeed", function()
    {
        freecam.speed.move = Math.round( (freecam.speed.move * 100) - 10 ) / 100;
        freecam.webView.emit('Speed:MoveSpeed', freecam.speed.move);
    });

    freecam.webView.on("Speed:IncreaseMoveSpeed", function()
    {
        freecam.speed.move = Math.round( (freecam.speed.move * 100) + 10 ) / 100;
        freecam.webView.emit('Speed:MoveSpeed', freecam.speed.move);
    });

    freecam.webView.on("Speed:DecreaseTurnSpeed", function()
    {
        freecam.speed.turn = Math.round( (freecam.speed.turn * 100) - 10 ) / 100;
        freecam.webView.emit('Speed:TurnSpeed', freecam.speed.turn);
    });

    freecam.webView.on("Speed:IncreaseTurnSpeed", function()
    {
        freecam.speed.turn = Math.round( (freecam.speed.turn * 100) + 10 ) / 100;
        freecam.webView.emit('Speed:TurnSpeed', freecam.speed.turn);
    });



    alt.on('keydown', (key) =>
    {
        if( key == 118 )
        {
            if( freecam.active )
            {
                freecam.stop();
            }
            else
            {
                freecam.start();
            }
        }

        if( key == 87 )
        {
            freecam.actions.moveF = true;
        }

        if( key == 65 )
        {
            freecam.actions.moveL = true;
        }

        if( key == 68 )
        {
            freecam.actions.moveR = true;
        }

        if( key == 83 )
        {
            freecam.actions.moveB = true;
        }

        if( key == 32 )
        {
            freecam.actions.moveU = true;
        }

        if( key == 16 )
        {
            freecam.actions.moveD = true;
        }

        if( key == 38 )
        {
            freecam.actions.rotU = true;
        }

        if( key == 40 )
        {
            freecam.actions.rotD = true;
        }

        if( key == 37 )
        {
            freecam.actions.rotL = true;
        }

        if( key == 39 )
        {
            freecam.actions.rotR = true;
        }
    });



    alt.on('keyup',( key) =>
    {
        if( key == 87 )
        {
            freecam.actions.moveF = false;
        }

        if( key == 65 )
        {
            freecam.actions.moveL = false;
        }

        if( key == 68 )
        {
            freecam.actions.moveR = false;
        }

        if( key == 83 )
        {
            freecam.actions.moveB = false;
        }

        if( key == 32 )
        {
            freecam.actions.moveU = false;
        }

        if( key == 16 )
        {
            freecam.actions.moveD = false;
        }

        if( key == 38 )
        {
            freecam.actions.rotU = false;
        }

        if( key == 40 )
        {
            freecam.actions.rotD = false;
        }

        if( key == 37 )
        {
            freecam.actions.rotL = false;
        }

        if( key == 39 )
        {
            freecam.actions.rotR = false;
        }
    });




    function calcCameraDirectionForward(camRot)
    {
        let rotInRad = {
            x: camRot.x * (Math.PI / 180),
            y: camRot.y * (Math.PI / 180),
            z: camRot.z * (Math.PI / 180) + (Math.PI / 2)
        }

        var camDir = {
            x: Math.cos(rotInRad.z),
            y: Math.sin(rotInRad.z),
            z: Math.sin(rotInRad.x)
        }

        return camDir;
    }


    function calcCameraDirectionRight(camRot)
    {
        let rotInRad = {
            x: camRot.x * (Math.PI / 180),
            y: camRot.y * (Math.PI / 180),
            z: camRot.z * (Math.PI / 180)
        }

        var camDir = {
            x: Math.cos(rotInRad.z),
            y: Math.sin(rotInRad.z),
            z: Math.sin(rotInRad.x)
        }

        return camDir;
    }