
function initMap() {
    var map = new AMap.Map('map',{
        resizeEnable: true,
        zoom: 10,
        center: [116.480983, 40.0958]
    });
    AMap.plugin(['AMap.ToolBar','AMap.Scale','AMap.OverView','AMap.MapType'], function(){
            map.addControl(new AMap.ToolBar());
            map.addControl(new AMap.Scale());
            map.addControl(new AMap.OverView({isOpen:true}));
            map.addControl(new AMap.MapType);
    });
}


$(function () {
    initMap();
    $('.show-search').click(function () {
        $('.search-bar').toggle();
    });
});