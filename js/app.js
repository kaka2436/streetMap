
var map;


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
                getMarks(result.position);
            }
        });
        AMap.event.addListener(geolocation, 'error', function () {
            alert("无法定位您的位置");
        });
    });
}

function getMarks(position) {
    AMap.service('AMap.PlaceSearch',function () {
        var placeSearch = new AMap.PlaceSearch({
            type:"餐饮服务",
            pageSize: 30,
        });

        placeSearch.searchNearBy("", position, 200, function(status, result) {
            if (status === 'complete' && result.info === 'OK') {
                makeMenu(result.poiList.pois);
            }
        });
    });
}

function makeMenu(marks) {
    marks.forEach(function (mark) {
        viewModel.markList.push(mark);
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
});