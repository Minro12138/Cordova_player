document.addEventListener("deviceready", onDeviceReady);

var isReplay = true;    //播放准备状态
var media = null;   //播放对象
var btn2Play = false;   //按钮播放状态
var tid1,tid2;  //进度定时器ID

function onDeviceReady() {
    console.log("启动");

    //------添加歌曲列表--------
    // var md = '<li data-icon="false" id="@liid">\n' +
    //     '                    <a style="background-color: white;">\n' +
    //     '                        <div class="bianhao">@musicid</div>\n' +
    //     '                        <div class="msg">\n' +
    //     '                            <h1>@songname</h1>\n' +
    //     '                            <p>2019-4-12</p>\n' +
    //     '                        </div>\n' +
    //     '                    </a>\n' +
    //     '                </li>';
    // var songs = ['G.E.M.邓紫棋 - 泡沫.mp3', 'G.E.M.邓紫棋 - 龙卷风.mp3', '周笔畅 - 岁月神偷.mp3', '火箭少女101 - 卡路里.mp3',
    //     '韩红、林俊杰 - 飞云之下.mp3'
    // ];
    // for (var i = 0; i < songs.length; i++) {
    //     var tmp = md;
    //     tmp = tmp.replace("@liid", "m" + i);
    //     tmp = tmp.replace("@musicid", i + 1);
    //     tmp = tmp.replace("@songname", songs[i]);

    //     $('#ullist').append(tmp);
    // }

    //------添加事件--------
    //参数1为事件名，参数2为子元素，参数3为触发该事件的回调函数
    $("#ullist").on("click", "li", function () {
        $("li a").css("background", "white"); //所有的LI恢复背景
        $(this.firstElementChild).css("background", "yellow"); //为当前单击的LI设置背景
        var id = $(this).prop("id"); //获取被单击的LI的id
        id = id.replace("m", "");
        //LI的id格式为：m0 m1 m2 ... ,去掉前缀则为数字了，代表播放的歌曲下标
        console.log("点击事件触发！id为" + id);
        //其他实现
        media = null;
        isReplay = true;
        console.log(songs[id]);
        playAudio(songs[id]);
    });

    //-------播放按钮事件-------
    $("#bn").on("click", "div", function () {
        $("#bn").children().css("background-color", "white");
        $(this).css("background-color", "red");
        var id = $(this).prop("id");
        if (id == "btn2") {
            changePlayorPause();
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
    src = cordova.file.applicationDirectory+"www/mp3/" + src;
    media = new Media(src,
        function () {
            console.log("play complete...");
        },
        function (err) {
            console.log("播放错误：" + JSON.stringify(err));
        },
        function (code) {
            switch (code) {
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
                case Media.MEDIA_RUNNING:
                    playPos();
                    break;
                case Media.MEDIA_PAUSED:
                    console.log("状态：暂停播放！");
                    // $("#btn2").css({
                    //     "background-image": "url('" + cordova.file.applicationDirectory + "www/img/播放.png')",
                    //     // "background-image": "url('" + "www/img/播放.png')",
                    //     "background-color": "red"
                    // });
                    btn2Play = false;
                    break;
                case Media.MEDIA_STOPPED:
                    afterStop();
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
    }
}

function afterStop() {
    console.log("播放完成！");
    isReplay = true;
    media = null; //注意！为了下次可以播放，要初始化
}

function afterPlay() {
    isReplay = false;
    //执行其他界面操作
}


function changePlayorPause() {
    console.log("点击播放/暂停");
    if (btn2Play) {
        console.log("按钮状态："+btn2Play);
        btn2Play = false;
        $("#btn2").css({
            "background-image": "url('" + cordova.file.applicationDirectory + "www/img/播放.png')"
            // "background-color": "red"
        });
        media.pause();
    } else {
        console.log("按钮状态："+btn2Play);
        btn2Play = true;
        $("#btn2").css({
            "background-image": "url('" + cordova.file.applicationDirectory + "www/img/暂停.png')"
            // "background-color": "red"
        });
        media.play();
    }
    // console.log("已暂停！");
}

function playPos()
{ 
   var len=-1;
   setInterval(function(){
       len=media.getDuration();
       if(len>0) {clearInterval(tid1);}
       len = Math.round(len/60)+":"+Math.round(len)%60;
    },100);
  
    
   tid2=setInterval(function(){
     	media.getCurrentPosition(function(pos){
          $("#time").html("当前播放位置："+pos+"/"+len);//注意修改id
     	},function(){});
   },200);
}