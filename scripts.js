"use strict";
/*global document: false */
/*global $,console */
var spawn = require('child_process').spawn;

function setImage(filePath, idx) {
    var img = new Image();
    img.src = filePath;
    img.width = 300;
    img.height = 300;
    $("#holder" + idx).append(img);
}

function createDiptych(img1, img2, orientation, borderColor) {
    var prc = spawn('montage',  ['-geometry', '+0+0', '-border', '5', '-bordercolor',
                                 borderColor, img1, img2, '/tmp/diptych.png']);
    
    //noinspection JSUnresolvedFunction
    prc.stdout.setEncoding('utf8');
    prc.stdout.on('data', function (data) {
        var str = data.toString()
        var lines = str.split(/(\r?\n)/g);
        console.log(lines.join(""));
    });
    
    prc.on('close', function (code) {
        console.log('process exit code ' + code);
    });
}



$(document).ready(function () {
    console.log("ready!");
    var holder = document.querySelectorAll('div[id^=holder]');
holder.ondragover = function () { this.className = 'hover'; return false; };
holder.ondragend = function () { this.className = ''; return false; };
holder.ondrop = function (e) {
    e.preventDefault();

    for (var i = 0; i < e.dataTransfer.files.length; ++i) {

        console.log(e.dataTransfer.files[i].path);
    }
    return false;
};
    
    $("input:file").change(function () {
        var fileName = $(this).val();
        var fileNumber = $(this).target;
        console.log("Chose file " + fileName);
        setImage(fileName, 1);
     });
    
    $("#make-button").click(function() {
        console.log("Clicked make button");
        var values = {};
        $.each($('#params').serializeArray(), function(i, field) {
            console.log("field: " + field);
            values[field.name] = field.value;
        });
        console.log(values);
        var img1 = $('#file1').val();
        var img2 = $('#file2').val();
        
        if (img1 == undefined || img1.length < 1) {
            window.open("Please select a first image");
        }
        
        if (img2 == undefined || img2.length < 1) {
            window.open("Please select a second image");
        }
        console.log("img1 : " + img1);
        createDiptych(img1, img2, '', values=['color']);
    });
});


