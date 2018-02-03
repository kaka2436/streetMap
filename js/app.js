
var map;
var localMark = [];
var markerList = [];
var centerPos;


function appViewModel() {
    var self = this;
    self.markList = ko.observableArray();

}
var viewModel = new appViewModel();


ko.applyBindings(viewModel);

function initMap() {
    map = new AMap.Map('map',{
        resizeEnable: true,
        zoom: 10,
        center: [121.49203,31.34651]
    });
    AMap.plugin(['AMap.ToolBar','AMap.Scale','AMap.OverView','AMap.MapType'], function(){
            map.addControl(new AMap.ToolBar());
            map.addControl(new AMap.Scale());
            map.addControl(new AMap.OverView({isOpen:true}));
            map.addControl(new AMap.MapType);
    });
    map.plugin('AMap.Geolocation', function () {
        geolocation = new AMap.Geolocation({
            enableHighAccuracy: true,//是否使用高精度定位，默认:true
            timeout: 10000,          //超过10秒后停止定位，默认：无穷大
            maximumAge: 0,           //定位结果缓存0毫秒，默认：0
            convert: true,           //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
            showButton: true,        //显示定位按钮，默认：true
            buttonPosition: 'LB',    //定位按钮停靠位置，默认：'LB'，左下角
            buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
            showMarker: true,        //定位成功后在定位到的位置显示点标记，默认：true
            showCircle: true,        //定位成功后用圆圈表示定位精度范围，默认：true
            panToLocation: true,     //定位成功后将定位到的位置作为地图中心点，默认：true
            zoomToAccuracy:true      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
        });
        map.addControl(geolocation);
        geolocation.getCurrentPosition(function (status,result) {
            if (status === 'complete'){
                centerPos = result.position;
                addCircel(result.position);
                getMarks(result.position);
            }
        });
        AMap.event.addListener(geolocation, 'error', function () {
            alert("无法定位您的位置");
        });
    });
}

function addCircel(position) {
    var circle = new AMap.Circle({
        center: position,
        radius: 200,
        fillOpacity:0.2,
        strokeWeight:1
    });
    circle.setMap(map);
}

function getMarks(position) {
    AMap.service('AMap.PlaceSearch',function () {
        var placeSearch = new AMap.PlaceSearch({
            type:"餐饮服务",
            pageSize: 30
        });

        placeSearch.searchNearBy("", position, 200, function(status, result) {
            if (status === 'complete' && result.info === 'OK') {
                localMark = result.poiList.pois;
                makeMenu(localMark);
            }
        });
    });
}

function makeMarker(mark) {
        var  marker = new AMap.Marker({
            position:[mark.location.lng,mark.location.lat],
            content:'<i class="fa fa-cutlery" aria-hidden="true" style="color:#8B4726;font-size:1.5em;"></i>',
            animation:"AMAP_ANIMATION_DROP",
            title:mark.name,
            clickable:true
        });
        marker.on('mouserover',function () {

        });
        return marker;
}

function bindMenuAndMarkerClick(menu,marker) {
    function clickEvent() {
        var cnt = [];
        cnt.push(menu.name);
        cnt.push(menu.address);
        var info = new AMap.InfoWindow({
            content:cnt.join("<br>"),
            offset: new AMap.Pixel(10, -30)
        });
        info.open(map,marker.getPosition());
        map.setCenter(marker.getPosition());
    }
    marker.on('click',clickEvent);
    menu.userClick = clickEvent;
}

function makeMenu(marks) {
    marks.forEach(function (mark) {
        mark.marker = makeMarker(mark);
        bindMenuAndMarkerClick(mark,mark.marker);
        viewModel.markList.push(mark);
        mark.marker.setMap(map);
    });
}



$(function () {
    initMap();
    getMarks();
    var isShowSearch = false;
    $('.show-search').click(function () {
        if (isShowSearch){
            $('.search-bar').hide();
            $('.map-body').removeClass('col-md-9 col-xs-6');
            isShowSearch = false;
        }else{
            $('.search-bar').show();
            $('.map-body').addClass('col-md-9 col-xs-6');
            isShowSearch = true;
        }
    });
    function searchHandle() {
        var search = $('.search-line').val();
        var reg = new RegExp(search);
        viewModel.markList.removeAll();
        localMark.forEach(function (t) {
            if (t.name.match(reg)){
                viewModel.markList.push(t);
                t.marker.setMap(map);
            }else{
                map.remove(t.marker);
            }
            map.setCenter(centerPos);
        });
        return false;
    }
    $('.search-line').bind('input propertychange', searchHandle);
    $('.search-btn').click(searchHandle);
});