// 地图对象
var map;
// 存储定位后获取的20个餐厅信息的数组
var localMark = [];
// 定位坐标，如果定位失败，则使用初始坐标
var centerPos = [116.397428, 39.90923];
// 获取地图上被点击的点标记
var clickedMarker;
// 定义knockout的监控对象
function appViewModel() {
    var self = this;
    // 定义侧边栏绑定的监控数组，值为localMark数组中被筛选过的值，随着搜索而变化
    self.markList = ko.observableArray();
}

var viewModel = new appViewModel();

// 地图加载失败后的处理
function errorHander() {
    alert('加载失败，请刷新重试');
}

// 绑定knockout监控对象
ko.applyBindings(viewModel);

// 地图加载成功之后的回调函数
function initMap() {
    //初始化高德地图提供的UI组件
    initAMapUI();
    // 初始化地图
    map = new AMap.Map('map', {
        resizeEnable: true,
        zoom: 10,
        center: [121.49203, 31.34651]
    });
    // 加载地图插件，如工具条、比例尺等
    AMap.plugin(['AMap.ToolBar', 'AMap.Scale', 'AMap.OverView', 'AMap.MapType'], function() {
        map.addControl(new AMap.ToolBar());
        map.addControl(new AMap.Scale());
        map.addControl(new AMap.OverView({
            isOpen: true
        }));
        map.addControl(new AMap.MapType);
    });
    // 加载定位插件
    map.plugin('AMap.Geolocation', function() {
        geolocation = new AMap.Geolocation({
            enableHighAccuracy: true, //是否使用高精度定位，默认:true
            timeout: 10000, //超过10秒后停止定位，默认：无穷大
            maximumAge: 0, //定位结果缓存0毫秒，默认：0
            convert: true, //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
            showButton: true, //显示定位按钮，默认：true
            buttonPosition: 'LB', //定位按钮停靠位置，默认：'LB'，左下角
            buttonOffset: new AMap.Pixel(10, 20), //定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
            showMarker: true, //定位成功后在定位到的位置显示点标记，默认：true
            showCircle: true, //定位成功后用圆圈表示定位精度范围，默认：true
            panToLocation: true, //定位成功后将定位到的位置作为地图中心点，默认：true
            zoomToAccuracy: true //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
        });
        map.addControl(geolocation);
        // 定位完成后获取当前坐标
        geolocation.getCurrentPosition(function(status, result) {
            if (status === 'complete') {
                centerPos = result.position;
                // 添加定位点周边的圆形覆盖
                addCircel(result.position);
                //获取定位点周边的20个餐厅信息
                getMarks(result.position);
            }
        });
        // 定位失败的处理
        AMap.event.addListener(geolocation, 'error', function() {
            alert('无法定位您的位置');
        });
    });
}

//添加定位点周边的圆形覆盖的函数
function addCircel(position) {
    var circle = new AMap.Circle({
        center: position,
        radius: 200,
        fillOpacity: 0.2,
        strokeWeight: 1
    });
    circle.setMap(map);
}

//获取定位点周边的20个餐厅信息的函数
function getMarks(position) {
    AMap.service('AMap.PlaceSearch', function() {
        var placeSearch = new AMap.PlaceSearch({
            type: '餐饮服务',
            pageSize: 20
        });

        placeSearch.searchNearBy("", position, 200, function(status, result) {
            if (status === 'complete' && result.info === 'OK') {
                localMark = result.poiList.pois;
                makeMenu(localMark);
            }
        });
    });
}

// 绑定侧边栏条目与点标记的点击事件
function bindMenuAndMarkerClick(mark, marker) {
    // 点击事件
    function clickEvent() {
        // 获取当前点击的点标记
        clickedMarker = marker;
        // 将除了当前点标记之外的点标记颜色设置为红色
        viewModel.markList().forEach(function(t) {
            t.marker.setIconStyle('red');
        });
        // 构建信息窗体中的信息
        var cnt = [];
        cnt.push(mark.name);
        // cnt.push('<hr/>');
        cnt.push('地址：' + mark.address);
        // 向flickr发送异步请求获取信息窗体中的照片
        $.ajax({
            url: 'https://api.flickr.com/services/rest/?method=flickr.photos.getRecent&api_key=21bde2ab08a008cffb296ce1d3b7a56e&format=json&nojsoncallback=1&per_page=1',
            success: function(result) {
                var imgObj = result.photos.photo[0];
                var imgurl = 'https://' + 'farm' + imgObj.farm + '.staticflickr.com/' + imgObj.server + '/' + imgObj.id + '_' + imgObj.secret + '_s.jpg'
                var img = '<img src="' + imgurl + '" />';
                cnt.splice(1, 0, img);
                var info = new AMap.InfoWindow({
                    content: cnt.join("<br>"),
                    offset: new AMap.Pixel(10, -30),
                    closeWhenClickMap: true
                });
                // 弹出信息窗体
                info.open(map, marker.getPosition());
            },
            error: function() {
                var info = new AMap.InfoWindow({
                    content: cnt.join("<br>"),
                    offset: new AMap.Pixel(10, -30),
                    closeWhenClickMap: true
                });
                info.open(map, marker.getPosition());
            }
        });
        map.setCenter(marker.getPosition());
        marker.setIconStyle('purple');
    }
    map.setFitView();
    marker.on('click', clickEvent);
    mark.userClick = clickEvent;
}
// 获取定位点周边的餐厅信息后，构建点标记和侧边栏菜单
function makeMenu(marks) {
    AMapUI.loadUI(['overlay/AwesomeMarker'],
        function(AwesomeMarker) {
            marks.forEach(function(mark) {
                mark.marker = new AwesomeMarker({
                    //设置awesomeIcon
                    awesomeIcon: 'fa fa-cutlery',
                    iconLabel: {
                        style: {
                            color: '#ffffff', //字体颜色
                            fontSize: 20 + 'px' //字号
                        }
                    },
                    //图标
                    iconStyle: 'red',
                    map: map,
                    topWhenClick: true,
                    topWhenMouseOver: true,
                    position: [mark.location.lng, mark.location.lat]
                });
                mark.marker.on('mouseover', function() {
                    if (mark.marker !== clickedMarker) {
                        mark.marker.setIconStyle('green');
                    }
                });
                mark.marker.on('mouseout', function() {
                    if (mark.marker !== clickedMarker) {
                        mark.marker.setIconStyle('red');
                    }
                });
                bindMenuAndMarkerClick(mark, mark.marker);
                viewModel.markList.push(mark);
            });
        });
}



$(function() {
    //获取定位点周边餐厅信息
    getMarks();
    var isShowSearch = false;
    // 设置侧边栏的开合
    $('.show-search').click(function() {
        if (isShowSearch) {
            $('.search-bar').hide();
            $('.map-body').removeClass('col-md-9 col-xs-6');
            isShowSearch = false;
        } else {
            $('.search-bar').show();
            $('.map-body').addClass('col-md-9 col-xs-6');
            isShowSearch = true;
        }
    });
    // 设置搜索方法
    function searchHandle() {
        var search = $('.search-line').val();
        var reg = new RegExp(search);
        viewModel.markList.removeAll();
        localMark.forEach(function(t) {
            if (t.name.match(reg)) {
                viewModel.markList.push(t);
                t.marker.setMap(map);
            } else {
                map.remove(t.marker);
            }
            map.setCenter(centerPos);
        });
        return false;
    }
    $('.search-line').bind('input propertychange', searchHandle);
    $('.search-btn').click(searchHandle);
});