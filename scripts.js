"use strict";
/*global document: false */
/*global $,console */
var spawn = require('child_process').spawn;
var fs = require('fs');

// TODO get rid of this global
var targetWidth = 0;

function setImage(filePath, idx, bgcolor) {
    $("#holder" + idx).empty();
    var img = new Image();
    img.id = "img" + idx;
    img.src = filePath;
    //img.width = 300;
    //img.height = 300;

    var canvas = $("#image-canvas")[0];
    var context = canvas.getContext("2d");

    img.onload = function () {
        var margin = 5;
        var natHeight = img.naturalHeight;
        var natWidth = img.naturalWidth;
        var multiplier = (300 - (margin * 2)) / natWidth;

        if (idx == '1') {
            //loading first image, scale to ideal size of canvas

            // BAD!! define these outside of if 
            var targetHeight = 300 - (margin * 2);
            var multiplier = targetHeight / natHeight;
            targetWidth = multiplier * natWidth;
            console.log("target width: " + targetWidth);
            var canvWidth = (targetWidth * 2) + (margin * 3);
            var canvHeight = targetHeight + (margin * 2);
            if (natWidth > natHeight) {
                // TODO finish this case
                canvHeight = (natHeight * 2) + (margin * 3);
                canvWidth = natWidth + (margin * 2);
            }

            //canvas.height = canvHeight;
            //canvas.width = canvWidth;
        } else {
            // loading 2nd image, scale to existing size of canvas

            // portrait source images case
            console.log("canvas width " + canvas.width);
            //var targetWidth = (canvas.width / 2) - (margin * 3);
            console.log("target width:" + targetWidth);
            var targetHeight = canvas.height - (margin * 2);
        }
        context.fillStyle = bgcolor;
        if (idx == '1') {
            context.fillRect(0, 0, canvas.width, canvas.height);
        }

        var xOffset = margin;
        var yOffset = margin;
        if (idx != '1') {
            // double portrait case
            xOffset = (margin * 2) + targetWidth;
        }
        console.log("drawing image " + img.src + " " + xOffset + " " + yOffset +
            " " + targetWidth + " " + targetHeight);
        context.drawImage(img, xOffset, yOffset, targetWidth, targetHeight);
    };

    //$("#holder" + idx).append(img);
}

function createDiptych(img1, img2, orientation, borderColor) {
    console.log("Creating diptych....");
    var prc = spawn('montage', ['-geometry', '+0+0', '-border', '5', '-bordercolor',
                                 borderColor, img1, img2, '/tmp/diptych.png']);

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
    var holders = $(".holder");

    holders.on('dragover', function (e) {
        e.preventDefault();
        e.stopPropagation();
    });

    holders.on('dragover', function (e) {
        e.preventDefault();
        e.stopPropagation();
    });

    holders.on('drop', function (e) {
        if (e.originalEvent.dataTransfer) {
            if (e.originalEvent.dataTransfer.files.length) {
                e.preventDefault();
                e.stopPropagation();

                // TODO check for size of 1
                var files = e.originalEvent.dataTransfer.files;

                var dropTargetId = $(e.target).attr('id');
                console.log("drop target id is " + dropTargetId);

                // which holder?
                var imgIdx = dropTargetId.substring('holder'.length);

                console.log("idx: " + imgIdx + ", files: " + files);
                for (var i = 0; i < files.length; ++i) {
                    var filePath = files[i].path;
                    console.log("Dropped file " + filePath);
                    setImage(filePath, imgIdx);
                    $("#dropped-file" + imgIdx).val(filePath);
                }
                return false;
            }
        }
    });

    var canvas = $("#image-canvas")[0];
    var context = canvas.getContext("2d");
    context.setLineDash([6]);
    context.strokeRect(0, 0, 400, 300);
    context.moveTo(200,0);
	context.lineTo(200,300);
	context.stroke();

    $("input:file").change(function (e) {
        var fileName = $(e.target).val();
        var fileInputId = $(e.target).attr('id');
        if (fileInputId.indexOf("file") == 0) {
            // handle an input image
            var inputIdx = fileInputId.substring('file'.length);

            var bgcolor = $('input:radio[name=color]:checked').val();
            console.log("bgcolor is " + bgcolor);
            console.log("Chose file " + fileName);
            setImage(fileName, inputIdx, bgcolor);
        }
    });

    $("#make-button").change(function (e) {
        var fileName = $(e.target).val();
        var canvas = $("#image-canvas")[0];
        var src = canvas.toDataURL();
        var imgstr = String(src).substring(22); // figure out what this magic # is

        fs.writeFile(fileName, new Buffer(imgstr, 'base64'), function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("The file " + fileName + " was saved!");
            }
        });
        return;
    });

    $("#clear-button").click(function () {
        console.log("clear button clicked");
        $("#file1").val("");
        $("#file2").val("");
        $("#dropped-file1").val("");
        $("#dropped-file2").val("");
        $(".holder").empty();
        $("#image-canvas")
    });
});