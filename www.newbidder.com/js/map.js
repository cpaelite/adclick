/**
 * Created by Administrator on 2016/7/18.
 */
$(document).ready(function () {
    // if (!os.isPc && !os.isIpad) {
    //     window.location.href = "./iphone/iphone.html";
    // }
    //取消加载动画
    function loading() {
        var googleMapUrl = "http://maps.googleapis.com/maps/api/js?key=AIzaSyBmBABCOpmHVA-e2EhOjKO3AJF5Rn8opYc&sensor=false&callback=initialize&language=en-DE";
        loadScript(googleMapUrl, function () {
            var imgArr = ['banner.jpg', 'page3-bg.jpg'];
            var n = 0;
            for (var i = 0; i < imgArr.length; i++) {
                imgLoad(imgArr[i], function () {
                    n++;
                    if (n == imgArr.length) {
                        $("#loading").fadeOut(600);
                    }
                });
            }
        });
    }

    loading();
    if (os.isPc && !os.isIpad) {
        $("body").addClass("PC");
        $('#dowebok').fullpage({
            menu: '#menu',
            scrollingSpeed: 500,
            paddingTop: 80,
            anchors: ['page1', 'page2', 'page3', 'page4', 'page5']
        });
    } else if (os.isIpad) {
        $("body").addClass("iPad");
        $(".menu-btn").click(function () {
            $("#menu").fadeToggle(0);
        });
        $(".section").each(function () {
            var self = $(this);
            $(this).attr("id", "page" + ($(this).index() + 1));
            scrollMonitor(self, self.index());
        });
        $("#menu li").each(function () {
            $(this).click(function () {
                $("#menu li").removeClass("active");
                $(this).addClass("active");
                $("#menu").fadeOut(300);
            });
        });
    }
});
//图片预加载
function imgLoad(imgSrc, fn) {
    var img = new Image();
    var baseSrc = "img/";
    img.src = baseSrc + imgSrc;
    console.log(img);
    img.onload = function () {
        fn();
        console.log(img + "加载完成");
    }
}
//google地图
function initialize() {
    var mapProp = {
        zoom: 15,
        DomContainer: document.getElementById("googleMap"),
        center: new google.maps.LatLng(31.2061189,121.5999203),
        mapName: 'newbidder',
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(mapProp.DomContainer, mapProp);

    var marker = new google.maps.Marker({
        position: mapProp.center
    });

    marker.setMap(map);

    var infowindow = new google.maps.InfoWindow({
        content: mapProp.mapName
    });
    marker.addListener('click', function () {
        infowindow.open(map, marker);
    });

    google.maps.event.addDomListener(window, 'load', initialize);
}
//加载script
function loadScript(src, fn) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = src;
    document.body.appendChild(script);
    fn && fn();
}

//判断媒体设备
var os = function () {
    var ua = navigator.userAgent,
        isQB = /(?:MQQBrowser|QQ)/.test(ua),
        isWindowsPhone = /(?:Windows Phone)/.test(ua),
        isSymbian = /(?:SymbianOS)/.test(ua) || isWindowsPhone,
        isAndroid = /(?:Android)/.test(ua),
        isFireFox = /(?:Firefox)/.test(ua),
        isChrome = /(?:Chrome|CriOS)/.test(ua),
        isIpad = /(?:iPad|PlayBook)/.test(ua),
        isTablet = /(?:iPad|PlayBook)/.test(ua) || (isFireFox && /(?:Tablet)/.test(ua)),
        isSafari = /(?:Safari)/.test(ua),
        isPhone = /(?:iPhone)/.test(ua) && !isTablet,
        isOpen = /(?:Opera Mini)/.test(ua),
        isUC = /(?:UCWEB|UCBrowser)/.test(ua),
        isPc = !isPhone && !isAndroid && !isSymbian;
    var language = navigator.language || navigator.browserLanguage;
    return {
        isQB: isQB,
        isTablet: isTablet,
        isPhone: isPhone,
        isAndroid: isAndroid,
        isPc: isPc,
        isOpen: isOpen,
        isUC: isUC,
        isIpad: isIpad,
        language: language
    };
}();
