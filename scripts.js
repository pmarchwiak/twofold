"use strict";
/*global document: false */
/*global $,console */
var spawn = require('child_process').spawn;

function setImage(filePath, idx) {
    $("#holder" + idx).empty();
    var img = new Image();
    img.id = "img" + idx;
    img.src = filePath;
    img.width = 300;
    img.height = 300;
    $("#holder" + idx).append(img);
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

    $("input:file").change(function () {
        var fileName = $(this).val();
        var fileNumber = $(this).target;
        console.log("Chose file " + fileName);
        setImage(fileName, 1);
    });

    $("#make-button").click(function () {
        var values = {};
        $.each($('#params').serializeArray(), function (i, field) {
            console.log("field: " + field);
            values[field.name] = field.value;
        });
        console.log(values);

        // serializeArray does not work on file inputs
        var img1 = $('#file1').val();
        if (img1 == "") {
            img1 = $("#dropped-file1").val();
        }
        var img2 = $('#file2').val();
        if (img2 == "") {
            img2 = $("#dropped-file2").val();
        }

        if (!img1 || img1 == "") {
            console.log("img1 not selected");
            return;
        }
        if (!img2 || img2 == "") {
            console.log("img2 not selected");
            return;
        }

        createDiptych(img1, img2, '', values = ['color']);
    });

    $("#clear-button").click(function () {
        console.log("clear button clicked");
        $("#file1").val("");
        $("#file2").val("");
        $("#dropped-file1").val("");
        $("#dropped-file2").val("");
        $(".holder").empty();
    });
});