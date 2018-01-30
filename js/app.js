
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