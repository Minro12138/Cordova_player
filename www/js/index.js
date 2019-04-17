document.addEventListener("deviceready", onDeviceReady);

var isReplay = true; //播放准备状态
var media = null; //播放对象
var btn2Play = false; //按钮播放状态
var tid1, tid2; //进度定时器ID
var id; //当前播放的歌曲id

function onDeviceReady() {
    console.log("启动");

    //------添加事件--------
    //参数1为事件名，参数2为子元素，参数3为触发该事件的回调函数
    $("#ullist").on("click", "li", function () {
        $("li a").css("background", "white"); //所有的LI恢复背景
        $(this.firstElementChild).css("background", "yellow"); //为当前单击的LI设置背景
        id = $(this).prop("id"); //获取被单击的LI的id
        id = id.replace("m", "");
        //LI的id格式为：m0 m1 m2 ... ,去掉前缀则为数字了，代表播放的歌曲下标
        console.log("点击事件触发！id为" + id);
        //其他实现
        stopAudio();
        media = null;
        isReplay = true;
        console.log(songs[id]);
        playAudio(songs[id]);
    });

    //-------播放按钮事件-------
    $("#bn").on("click", "div", function () {
        $("#bn").children().css("background-color", "white");
        // $(this).css("background-color", "red");
        var bid = $(this).prop("id");
        id = Number(id);
        if (bid == "btn2") {
            changePlayorPause();
        } else if (bid == "btn1") {
            console.log('点击上一首');
            id = id -1;
            changeSong(id);
        } else if (bid == "btn3") {
            console.log('点击下一首');
            id = id+1;
            changeSong(id);
        } else {
            console.log('点击停止按钮');
            stopAudio();
            afterStop();
        }
    });
}


function playAudio(src) {
    if (media == null || isReplay) {
        stopAudio(); //此处只在isReplay才会执行

        // 异步执行
        tid = setInterval(function () {
            if (media == null) //等待为null 才可以重新创建对象
            {
                clearInterval(tid);
                replayAudio(src); //避免代码太长，写为函数
            }
        }, 100);

    } else {
        console.log("继续播放");
        // changePlayorPause();
        media.play(); //到这一步，说明是暂停的，继续播放
        // btn2Play = true;
    }
}

function replayAudio(src) {
    console.log("开始播放！");
    src = cordova.file.applicationDirectory + "www/mp3/" + src;
    media = new Media(src,
        function () {
            console.log("play complete...");
        },
        function (err) {
            console.log("播放错误：" + JSON.stringify(err));
        },
        function (code) {
            switch (code) {
                //-----开始播放时-----
                case Media.MEDIA_STARTING:
                    afterPlay();
                    console.log("状态：开始播放!");
                    btn2Play = true;
                    $("#btn2").css({
                        "background-image": "url('" + cordova.file.applicationDirectory + "www/img/暂停.png')",
                        // "background-image": "url('" + "www/img/暂停.png')",
                        "background-color": "red"
                    });
                    break;

                    //-----进行播放时-----
                case Media.MEDIA_RUNNING:
                    //-----旋转图片-----
                    // var angle = 0;
                    // for (var i = 0; i < 360; i++) {
                    //     $("#fimg").css("transform", "rotate(" + angle + "deg)");
                    //     angle += 5;
                    // }
                    playPos();
                    break;

                    //-----暂停时-----
                case Media.MEDIA_PAUSED:
                    console.log("状态：暂停播放！");
                    // $("#btn2").css({
                    //     "background-image": "url('" + cordova.file.applicationDirectory + "www/img/播放.png')",
                    //     // "background-image": "url('" + "www/img/播放.png')",
                    //     "background-color": "red"
                    // });
                    btn2Play = false;
                    break;

                    //-----停止时-----
                case Media.MEDIA_STOPPED:
                    if (isReplay == false) {
                        afterStop();
                    }
                    break;
            }
        });

    media.play(); //调用一次后，才会触发创建对象时关联的各个事件
    // btn2Play = false;
}

function stopAudio() {
    console.log("停止播放！");
    //清除进度显示(假如有)，以及重新初始华其他操作，为下一次播放做准备
    if (media != null) {
        media.stop();
        $("#time").html("完成");
    }
}

function afterStop() {
    console.log("播放完成！初始化了。");
    // clearInterval(tid2);
    // console.log("清除定时器tid2");
    isReplay = true;
    media = null; //注意！为了下次可以播放，要初始化
    btn2Play = true;
    $('#ullist li a').css("background", "white"); //所有的LI恢复背景
    $("#a"+id).css("background", "yellow");
}

function afterPlay() {
    isReplay = false;
    //执行其他界面操作
}


function changePlayorPause() {
    console.log("点击播放/暂停 按钮");
    if (btn2Play) {
        console.log("按钮状态：" + btn2Play);
        btn2Play = false;
        $("#btn2").css({
            "background-image": "url('" + cordova.file.applicationDirectory + "www/img/播放.png')"
            // "background-color": "red"
        });
        media.pause();
    } else {
        console.log("按钮状态：" + btn2Play);
        btn2Play = true;
        $("#btn2").css({
            "background-image": "url('" + cordova.file.applicationDirectory + "www/img/暂停.png')"
            // "background-color": "red"
        });
        media.play();
    }
    // console.log("已暂停！");
}

function playPos() {
    var len = -1;
    setInterval(function () {
        len = media.getDuration();
        if (len > 0) {
            clearInterval(tid1);
        }
        len = Math.round(len / 60) + ":" + Math.round(len) % 60;
    }, 100);

    tid2 = setInterval(function () {
        media.getCurrentPosition(function (pos) {
            $("#time").html("当前播放位置：" + parseInt(pos / 60) + ":" + (Array(2).join('0') + Math.round(pos) % 60).slice(-2) + "/" + len); //显示播放的进度文字
        }, function () {});
    }, 200);
}

//初始化
function changeSong(songid) {
    console.log('点击后，当前的id：' + songid);
    stopAudio();
    afterStop();
    if (songid < 0) {
        songid = 0;
        id = 0;
        console.log(songs[songid]);
        playAudio(songs[songid]);
    } else if (songid > songs.length-1) {
        songid = songs.length-1;
        id = songid;
        console.log(songs[songid]);
        playAudio(songs[songid]);
    } else {
        console.log(songs[songid]);
        playAudio(songs[songid]);
    }
}