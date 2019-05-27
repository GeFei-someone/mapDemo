<template>
    <div class="wrap">
        <div class="distribu_wrap">
            <div class="left" >
                <h4>{{ title }}</h4>
                <div class="area_list" v-if="activeState">
                    <h3>雄安数字建材平台企业分布排名</h3>
                    <ul  class="area_list_go">
                        <li v-for="(item, index) in homebution" :key="index" v-if="index < 10">
                            <div class="list_title">
                                {{ item.ranking }}.{{ item.name }}（{{ item.value }}）
                            </div>
                            <div class="list_box">
                                <div class="list_box_active" :style="{'width': (item.value / homebutionnum)*100 +'%'}"></div>
                            </div>
                        </li>
                    </ul>
                </div>
                <div class="enterprise_list" v-if="activeState1">
                    <ul>
                        <li @mouseenter="matchingenterprisemouseenter(item,index+1)" @mouseleave="matchingenterprisemouseleave(item,index+1)" @click="matchingenterpriseclick(item,index+1)" v-for="(item, index) in matchingenterpriseList" :key="index">
                            <!-- sigactive -->
                            <div class="sig " :class="{'sigactive': activemetchmouseenter == index+1}">{{ index+1 }}</div>
                            <div class="enterprise_right">
                                <div class="enterprise_title">{{ item.companyName }}</div>
                                <div class="enterprise_address">{{ item.address }}</div>
                            </div>
                        </li>
                        
                    </ul>
                </div>
                <div class="enterprise_cont" v-if="activeState3">
                    <div class="enterprise_cont_title">
                        <div class="title_box" @click="exitcont">
                            <i class="icon iconfont icon-fanhui"></i>
                            <span>返回</span>
                        </div>
                    </div>
                    <div class="enterprise_cont_box">
                        <p :title="itemList.companyName"class="enterprise_cont_box_title">{{ itemList.companyName }}</p>
                        <p :title="itemList.address" ><i class="icon iconfont icon-dizhi"></i>{{ itemList.address }}</p>
                        <p><i class="icon iconfont icon-zhanghu"></i>{{ itemList.applyUser }}</p>
                        <p><i class="icon iconfont icon-web-icon-"></i>{{ itemList.comCell }}</p>
                        <p><i class="icon iconfont icon-youxiang"></i>{{ itemList.comMail }}</p>
                    </div>
                    <div class="enterprise_cont_introduce">
                        <h3>企业简介：</h3>
                        <div class="introduce_cont">
                            {{ itemList.comIntro}}
                        </div>
                    </div>
                    <div class="enterprise_cont_product">
                         <h3>相关产品：</h3>
                         <ul class="product_list">
                             <li v-for="(item, index) in productList" :key="index" @click="productCont(item)">
                                 <img :src="item.fileUrl" alt="">
                                 <p>{{ item.productName }}</p>
                             </li>
                         </ul>
                    </div>
                </div>
            </div>
            <div class="right">
                <div class="right_head">
                    <div class="head_left">
                         <el-autocomplete
                            class="inline-input"
                            v-model="searchInput"
                            :fetch-suggestions="querySearch"
                            placeholder="搜索企业名称"
                            @select="handleSelect"
                            suffix-icon="el-icon-search"
                            valueKey="companyName"
                        ></el-autocomplete>
                        <!-- <el-input
                            placeholder="搜索企业名称"
                            v-model="searchInput">
                            <i slot="suffix" class="el-input__icon el-icon-search"></i>
                        </el-input> -->
                    </div>

                    <div class="head_right">
                        <span class="right_title">距雄安距离：</span>
                        <el-select v-model="distance" placeholder="请选择">
                            <el-option label="全部" value=""></el-option>
                            <el-option
                            v-for="item in options"
                            :key="item.code"
                            :label="item.title"
                            :value="item.code">
                            </el-option>
                    </el-select>
                    </div>
                </div>
                <div class="main_wrap"  v-show="activeState">
                    <div ref="main" class="main_box"></div>
                    <div class="Rankingtips">
                        <p>分布指数</p>
                        <div class="color_tip">
                            <span style="float: left">高</span>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <span style="margin-left: 5px">低</span>
                        </div>
                    </div>
                </div>
                <div class="main_wrap" v-show="activeState2">
                    <div id="container" style="height: 100%"></div>
                </div>

            </div>
        </div>
    </div>
</template>

<script>
    import 'echarts/map/js/china.js';
    import MapLoader from 'components/home/AMap'
    export default {
        data() {
            return {
                title: "建材企业发布",
                options: [
                    {title: "100公里",code: 100},
                    {title: "500公里",code: 500}
                ],
                distance: "",
                searchInput: "",
                map: "",
                homebution: [],
                homebutionnum: 0,
                region: [],
                matchingenterpriseList: [],
                activemetchmouseenter: "",
                markers: [],
                matchingenterpriseState: false,
                infoWindow: [],
                matchingenterpriseListState: false,
                matchingenterprisecontState: false,
                itemList: [],
                productList: [],
                enterprise: [],
                activeState: true,// 显示中国地图
                activeState1: false,// 显示企业列表
                activeState2: false,// 显示高德地图
                activeState3: false,// 显示企业内容



            }
        },
        mounted() {
            this.gethomebution();
            this.$ajax.get(this.HOST + "/redesign/home/findCompanyAll").then( (res) => {
                this.enterprise = res.data.resultObject;
                for (let i = 0; i < res.data.resultObject.length; i++) {
                    this.region.push(res.data.resultObject[i].address)
                }
            })
            this.$nextTick( () => {
                this.generateEcharts();
            })
        },
        methods: {
            // 搜索
            querySearch(queryString, cb) {
                var restaurants = this.enterprise;
                var results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants;
                // 调用 callback 返回建议列表的数据
                cb(results);
            },
            createFilter(queryString) {
                return (restaurant) => {
                    return (restaurant.companyName.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
                };
            },
            handleSelect(item) {
                this.itemList = item;
                this.activeState = false;
                this.activeState1 = false;
                this.activeState2 = true;
                this.activeState3 = true;
                let that = this;
                MapLoader().then(AMap => {
                    that.map = new AMap.Map('container', {
                        center: [116.05438, 38.98065],
                        // center: [116.397428, 39.90923],
                        zoom: 5
                    })

                    
                    let geocoder = new AMap.Geocoder({
                    city: '全国', //城市设为北京，默认：“全国”
                    });
                    geocoder.getLocation(item.address, (status, result) => {
                        let markerContent = '' +
                            '<div class="custom-content-marker" style="position: relative;">' +
                            '   <img src="//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png" style="width: 25px;height: 34px">' +
                            '</div>';
                        let marker = new AMap.Marker({
                            // icon: "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png",
                            content: markerContent,                                
                            position: result.geocodes[0].location,
                            offset: new AMap.Pixel(-13, -30),
                        });
                        marker.setMap(this.map);
                        this.infoWindow = new AMap.InfoWindow({
                            position: result.geocodes[0].location,
                            offset: new AMap.Pixel(0, -35),
                            content: item.companyName
                        });

                        this.infoWindow.open(this.map);
                        that.map.setCenter(result.geocodes[0].location); //设置地图中心点
                        that.map.setZoom(30);
                    })
                })
                
                // this.distance
                console.log(item)
            },
            // 返回
            exitcont() {
                if(this.distance == "") {
                    this.activeState = true;
                    this.activeState2 = false;
                    this.activeState3 = false;
                    this.handleSelect = "";
                    return false;
                }
                this.Scottmap();
                this.searchInput = "";
                this.activeState1 = true;
                this.activeState2 = true;
                this.activeState3 = false;

            },
            // 产品点击
            productCont(item) {
                this.$router.push({ path: "productcont", query: { productId: item.productId,companyInfoId:item.companyInfoId }})
            },
            // 企业点击
            matchingenterpriseclick(item,index) {
                this.activeState3 = true;
                this.activeState1 = false;
                this.activeState = false;

                this.itemList = item;
                // this.map.remove(overlayGroups);
                let geocoder = new AMap.Geocoder({
                    city: '全国', //城市设为北京，默认：“全国”
                });
                geocoder.getLocation(item.address, (status, result) => {
                    this.map.setCenter(result.geocodes[0].location); //设置地图中心点
                    this.map.setZoom(30);
                })
                // let marker = new AMap.Marker({
                //     // icon: "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png",
                //     content: markerContent,                                
                //     position: result.geocodes[0].location,
                //     offset: new AMap.Pixel(-13, -30),
                //     extData:{
                //         id: markernum
                //     }
                // });
                // 获取企业产品
                this.$ajax.get(this.HOST + "/product/tproductinfo/list",{
                    params: {
                        brand: item.companyInfoId,
                        page: 1,
                        limit: 10
                    }
                }).then( (res) => {
                    this.productList = res.data.resultObject.list;
                })
            },
            // 企业鼠标经过
            matchingenterprisemouseenter(item,index) {
                this.activemetchmouseenter = index;
                let targetMarker = {};
                for (let i = 0; i < this.markers.length; i++) {
                    let id = this.markers[i].getExtData().id;
                    if(id == index){
                        targetMarker = this.markers[i];
                        break;
                    }
                }
                let markerContent = '' +
                    '<div class="custom-content-marker" style="position: relative;">' +
                    '   <img src="//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png" style="width: 25px;height: 34px">' +
                    '<div style="position: absolute;left: 9px;top: 0;margin: auto;color: #ffffff">'+ index +'</div>'+
                    '</div>';
                // targetMarker.setIcon('//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png');
                targetMarker.setContent(markerContent)
                let position =  targetMarker.getPosition();
                this.infoWindow = new AMap.InfoWindow({
                    position: position,
                    offset: new AMap.Pixel(0, -35),
                    content: item.companyName
                });

                this.infoWindow.open(this.map);
            },
            // 企业鼠标离开
            matchingenterprisemouseleave(item,index) {
                this.activemetchmouseenter = "";
                let targetMarker = {};
                for (let i = 0; i < this.markers.length; i++) {
                    let id = this.markers[i].getExtData().id;
                    if(id == index){
                        targetMarker = this.markers[i];
                        break;
                    }
                }
                let markerContent = '' +
                    '<div class="custom-content-marker" style="position: relative;">' +
                    '   <img src="//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png" style="width: 25px;height: 34px">' +
                    '<div style="position: absolute;left: 9px;top: 0;margin: auto;color: #ffffff">'+ index +'</div>'+
                    '</div>';
                // targetMarker.setIcon('//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png');
                targetMarker.setContent(markerContent)
                this.map.remove(this.infoWindow);
            },
            gethomebution() {
                this.$ajax.get(this.HOST + "/redesign/home/findEnterpriseistribution").then( (res) => {
                    this.homebution = res.data.resultObject;
                })
                
            },
            randomData() {  
                return Math.round(Math.random()*500);  
            },
            // 高德地图
            Scottmap() {
                let that = this;
                that.matchingenterpriseList = [];
                that.markers = [];
                that.activemetchmouseenter = "";
                that.activeState1 = true;
                that.activeState = false;
                that.activeState2 = true;
                that.map = "";
                MapLoader().then(AMap => {
                    console.log('地图加载成功')
                    that.map = new AMap.Map('container', {
                        center: [116.05438, 38.98065],
                        // center: [116.397428, 39.90923],
                        zoom: 5
                    })
                    // 绘制高亮
                    var district = new AMap.DistrictSearch({
                        // 返回行政区边界坐标等具体信息
                        extensions: 'all',
                        // 设置查询行政区级别为 区 
                        level: 'district'
                    })
                    var polygons=[];
                    var polygons2=[];
                    var polygons3=[];

                    district.search('安新县', (status, result) => {
                        if(polygons) {
                            that.map.remove(polygons)//清除上次结果
                        }
                        polygons = [];
                        let bounds = result.districtList[0].boundaries;
                        if (bounds) {
                            for (let i = 0; i < bounds.length; i++) {
                                //生成行政区划polygon
                                var polygon = new AMap.Polygon({
                                    strokeWeight: 1,
                                    path: bounds[i],
                                    fillOpacity: 0.4,
                                    fillColor: '#80d8ff',
                                    strokeColor: '#0091ea'
                                });
                                polygons.push(polygon);
                                
                            }
                        }
                        that.map.add(polygons);
                    });
                    district.search('雄县', (status2, result2) => {
                        if(polygons2) {
                            that.map.remove(polygons2)//清除上次结果
                        }
                        polygons2 = [];
                        let bounds = result2.districtList[0].boundaries;
                        if (bounds) {
                            for (let i = 0; i < bounds.length; i++) {
                                //生成行政区划polygon
                                var polygon = new AMap.Polygon({
                                    strokeWeight: 1,
                                    path: bounds[i],
                                    fillOpacity: 0.4,
                                    fillColor: '#80d8ff',
                                    strokeColor: '#0091ea'
                                });
                                polygons2.push(polygon);
                                
                            }
                        }
                        that.map.add(polygons2)
                    })
                    district.search('容城县', (status2, result2) => {
                        if(polygons3) {
                            that.map.remove(polygons2)//清除上次结果
                        }
                        polygons3 = [];
                        let bounds = result2.districtList[0].boundaries;
                        if (bounds) {
                            for (let i = 0; i < bounds.length; i++) {
                                //生成行政区划polygon
                                var polygon = new AMap.Polygon({
                                    strokeWeight: 1,
                                    path: bounds[i],
                                    fillOpacity: 0.4,
                                    fillColor: '#80d8ff',
                                    strokeColor: '#0091ea'
                                });
                                polygons3.push(polygon);
                                
                            }
                        }
                        that.map.add(polygons3)
                    })
                    // 构造矢量圆形
                    let circle = new AMap.Circle({
                        center:  [116.05438, 38.98065],
                        radius: that.distance * 1000,  //半径
                        strokeColor: "#ffffff",  //线颜色
                        strokeOpacity: 1,  //线透明度
                        strokeWeight: 3,  //线粗细度
                        fillColor: "#276cd4",  //填充颜色
                        fillOpacity: 0.2 //填充透明度
                    });
                    
                    that.map.add(circle);
                    that.map.setFitView(circle);

                    let lnglat = new AMap.LngLat(116.05438, 38.98065) // lng, lat 替换成传入的坐标 
                    let polylinePath = [
                        new AMap.LngLat(116.05438, 38.98065),
                        new AMap.LngLat(lnglat.offset(that.distance * 1000,0).lng,38.98065)
                    ];

                    // 创建线覆盖物
                    let polyline = new AMap.Polyline({
                        path: polylinePath,
                        strokeColor: "#ffffff", //线颜色
                        strokeOpacity: 1,       //线透明度
                        strokeWeight: 2,        //线宽
                        strokeStyle: "solid",   //线样式
                        strokeDasharray: [10, 5] //补充线样式
                    });

                    that.map.add(polyline);
                    // 绘制字
                    let textPos = lnglat.offset(that.distance * 500,that.distance * 50);
                    let text = new AMap.Text({
                        text: `${ that.distance }公里`,
                        position: textPos,
                        map: this.map,
                        style:{
                                'background': 'transparent',
                                'border': '0 none',
                                'color': '#276cd4',
                                'font-size':'14px'}
                    })
                    that.map.add(text);
                    // 测试距离
                    let Centralpoint = [116.05438, 38.98065];
                    let targetpoint = this.region
                    // debugger
                    // 转经纬度
                    let geocoder = new AMap.Geocoder({
                        city: '全国', //城市设为北京，默认：“全国”
                    });
                    let markernum = 0
                    for (let i = 0; i < targetpoint.length; i++) {
                        geocoder.getLocation(targetpoint[i], (status, result) => {
                            // debugger
                            if (status === 'complete'&& result.geocodes.length) {
                                let dis = AMap.GeometryUtil.distance(Centralpoint,result.geocodes[0].location);
                                // 点标记显示内容，HTML要素字符串
                                if(dis <= that.distance * 1000) {
                                    markernum++;
                                    let markerContent = '' +
                                        '<div class="custom-content-marker" style="position: relative;">' +
                                        '   <img src="//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png" style="width: 23px;height: 30px">' +
                                        '<div style="width: 23px;position: absolute;left: 0px;top: 0;margin: auto;color: #ffffff;text-align: center">'+ markernum +'</div>'+
                                        '</div>';
                                    this.$ajax.get(this.HOST + "/redesign/home/findCompanyAll").then( (res) => {
                                        this.matchingenterpriseList.push(res.data.resultObject[i])
                                    })
                                    let marker = new AMap.Marker({
                                        // icon: "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png",
                                        content: markerContent,                                
                                        position: result.geocodes[0].location,
                                        offset: new AMap.Pixel(-13, -30),
                                        extData:{
                                            id: markernum
                                        }
                                    });

                                    that.markers.push(marker);
                                    marker.setMap(this.map);

                                }
                            }
                    })
                    }
                    that.matchingenterpriseState = true;
                    // targetpoint.join(",")

                    



                }, e => {
                    console.log('地图加载失败' ,e)
                })
            },
            // 中国地图
            generateEcharts() {
                var echarts = require('echarts');
                // 基于准备好的dom，初始化echarts实例
                var myChart = echarts.init(this.$refs.main);
                this.$ajax.get(this.HOST + "/redesign/home/findEnterpriseistribution").then( (res) => {
                    this.homebution = res.data.resultObject;
                    var data = [];

                    for (let i = 0; i < res.data.resultObject.length; i++) {
                        this.homebutionnum += res.data.resultObject[i].value;
                        let classnum = ""
                        if(res.data.resultObject[i].ranking == 1) {
                            classnum = "#1669e6"
                        }else if(res.data.resultObject[i].ranking > 1 && res.data.resultObject[i].ranking <= 4) {
                            classnum = "#31a4ed"
                        }else if(res.data.resultObject[i].ranking > 4 && res.data.resultObject[i].ranking <= 10) {
                            classnum = '#2cccfd'
                        }else if(res.data.resultObject[i].ranking > 10 && res.data.resultObject[i].ranking <= 20) {
                            classnum = '#7fe2fd'
                        }else {
                            classnum = '#d9f4fe'
                        }
                        data.push(
                            {
                                name: res.data.resultObject[i].name,
                                itemStyle: {
                                    normal: {
                                        areaColor: classnum,
                                        // borderWidth: 2
                                    },
                                    emphasis: {//高亮状态下的多边形和标签样式
                                        borderWidth: 1,
                                        // borderColor: '#d9f4fe',
                                        areaColor: '#d9f4fe',
                                        label: {
                                            shadowColor: '#d9f4fe', //默认透明
                                            shadowBlur: 10,
                                            show: true,
                                            textStyle: {
                                                fontSize: 12,
                                                color: '#3db77f'
                                            }
                                        }
                                    }
                                },
                                label: {
                                    normal: {
                                        show: true,
                                        textStyle: {
                                            fontSize: 12,
                                            color: '#0d6fb8'
                                        }
                                    },
                                    emphasis: {
                                        show: true,
                                        color: '#3db77f'
                                    }
                                },
                                value: res.data.resultObject[i].value ? res.data.resultObject[i].value: "",
                                ranking: res.data.resultObject[i].ranking ? res.data.resultObject[i].ranking: ""
                            }
                        )
                    }
                    // 绘制图表，准备数据
                    var option = {
                        tooltip: {
                            formatter:  (params) => {
                                var info = "";
                                    if(params.data) {
                                        info = `<div style="width: 60px;height: 60px">
                                            <p style="font-size:12px">${ params.name }</p>
                                            <p style="font-size:12px">${ params.data.value }</p>
                                            <p style="font-size:12px">排名：${ params.data.ranking }</p>

                                        </div>`
                                    }else {
                                        info = `<div style="width: 60px;height: 60px">
                                            <p style="font-size:12px">${ params.name }</p>
                                        </div>`
                                    }
             

                                return info;
                            },
                            backgroundColor: "rgba(0,0,0,.6)",//提示标签背景颜色
                            textStyle: { color: "#fff" } //提示标签字体颜色
                        },
                        //配置属性
                        series: [{  
                            name: '数据',  
                            type: 'map',  
                            mapType: 'china',   
                            roam: true,  
                            label: {  
                                normal: {  
                                    show: false  //省份名称  
                                },  
                                emphasis: { 
                                    show: false  
                                }  
                            },  
                            data: data  //数据
                        }],
                    };
                    //使用制定的配置项和数据显示图表
                    myChart.setOption(option);
                })



            }
        },
        watch: {
            "distance"(newval,oloval) {
                if(newval != "") {
                    this.Scottmap();
                    this.matchingenterprisecontState = true;
                    this.searchInput = ""
                }else {
                    this.map.destroy();
                    this.activeState = true;
                    this.activeState1 = false;
                    this.activeState2 = false;
                    this.activeState3 = false;

                }

            }
        }
    }
</script>

<style lang="less" scoped>
    .wrap {
        width: 100%;
        // height: 100%;
        margin-top: 20px;
        .distribu_wrap {
            width: 1230px;
            height: 570px;
            background: #ffffff;
            margin: 0 auto;
            display: flex;
            h4 {
                flex: 0 0 430px;
                padding: 16px 24px;
                padding-right: 0;
                font-size: 16px;
                color: #276cd4;
                font-weight: bold;
                position: relative;
                border-bottom: 1px solid #eaeaea;

                &::after {
                    content: '';
                    display: block;
                    position: absolute;
                    left: 24px;
                    bottom: 0;
                    width: 68px;
                    height: 1px;
                    background: #276cd4;
                }
                &:last-child {
                    flex: 0 0 215px;
                }
            }
            .left {
                height: 100%;
                flex: 0 0 336px;
                border-right: 1px solid #eaeaea;
                position: relative;
                &::after {
                    content: '';
                    display: block;
                    position: absolute;
                    right: -1;
                    top: 0;
                    width: 1px;
                    height: 56px;
                    background: #ffffff;
                }
                .area_list {
                    margin-top: 30px;
                    padding: 0 24px;
                    h3 {
                        widows: 100%;
                        height: 32px;
                        background: rgba(39, 108, 212, .1);
                        color: #276cd4;
                        font-size: 16px;
                        text-align: center;
                        line-height: 32px;
                    }
                    .area_list_go {
                        margin-top: 36px;
                        li {
                            margin-bottom: 22px;
                            display: flex;
                            align-items: center;
                            .list_title {
                                flex: 0 0 100px;
                                font-size: 12px;
                                color: #3c3c3c;
                            }
                            .list_box {
                                flex: 1;
                                margin-left: 30px;
                                background: #f0f0f0;
                                height: 4px;
                                border-radius: 12px;
                                position: relative;
                                .list_box_active {
                                    background: #3ac8ed;
                                    width: 0;
                                    height: 4px;
                                    position: absolute;
                                    left: 0;
                                    top: 0;
                                    bottom: 0;
                                    margin: auto;
                                    border-radius: 12px;
                                    transition: width .45s linear;
                                }
                            }
                        }
                    }
                }
                .enterprise_list {
                    margin-top: 30px;
                    height: 483px;
                    padding: 0 24px;
                    overflow-y: auto;
                    ul {
                        
                        li {
                            // margin-bottom: 30px;
                            position: relative;
                            display: flex;
                            height: 58px;
                            padding: 6px;
                            .sig {
                                flex: 0 0 20px;
                                height: 30px;
                                background: url(../../assets/redsig.png) no-repeat center;
                                background-size: 100%;
                                text-align: center;
                                color: #ffffff;
                            }
                            .sigactive {
                                background: url(../../assets/bluesig.png) no-repeat center;
                                background-size: 100%;
                            }
                            .enterprise_right {
                                flex: 1;
                                margin-left: 8px;
                                .enterprise_title {
                                    font-size: 14px;
                                    width: 260px;
                                    color: #3c3c3c;
                                    white-space: nowrap;
                                    overflow: hidden;
                                    text-overflow: ellipsis;
                                }
                                .enterprise_address {
                                    width: 260px;
                                    font-size: 14px;
                                    color: #969696;
                                    margin-top: 7px;
                                    white-space: nowrap;
                                    overflow: hidden;
                                    text-overflow: ellipsis;
                                }
                            }
                            &:hover {
                                background: #f7f7f7;
                                cursor: pointer;
                            }
                        }
                    }
                }
                .enterprise_cont {
                    margin-top: 10px;
                    height: 483px;
                    padding: 0 24px;
                    overflow-y: auto;
                    .enterprise_cont_title {
                        width: 100%;
                        height: 32px;
                        background: #f5f5f5;
                        font-size: 14px;
                        color: #969696;
                        display: flex;
                        align-items: center;
                        .title_box {
                            cursor: pointer;
                        }
                        span {
                            margin-left: 10px;
                        }
                        i {
                            color: #276cd4;
                            font-size: 18px;
                            margin-left: 10px;
                        }
                    }
                    .enterprise_cont_box {
                        margin-top: 14px;
                        padding: 10px;
                        border-bottom: 1px solid #d6d6d6;
                        padding-bottom: 20px;
                        p {
                            margin-top: 16px;
                            display: flex;
                            align-items: center;
                            color: #969696;
                            font-size: 14px;
                            width: 260px;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            i {
                                font-size: 14px;
                                margin-right: 10px;
                            }
                        }
                        .enterprise_cont_box_title {
                            font-size: 14px;
                            font-weight: bold;
                            color: #3c3c3c;
                            margin-top: 0;
                        }

                    }
                    .enterprise_cont_introduce {
                        margin-top: 16px;
                        padding-bottom: 20px;
                        border-bottom: 1px solid #d6d6d6;
                        h3 {
                            font-size: 14px;
                            color: #3c3c3c;
                            
                        }
                        .introduce_cont {
                            margin-top: 14px;
                            font-size: 14px;
                            color: #969696;
                            line-height: 20px;
                        }
                    }
                    .enterprise_cont_product {
                        margin-top: 16px;
                        h3 {
                            font-size: 14px;
                            color: #3c3c3c;
                            
                        }
                        .product_list {
                            margin-top: 14px;
                            display: flex;
                            flex-wrap: wrap;
                            justify-content: space-between;
                            li {
                                cursor: pointer;
                                img {
                                    width: 130px;
                                    height: 130px;
                                    background: #969696;
                                }
                                p {
                                    margin: 10px 0;
                                    font-size: 12px;
                                    color: #3c3c3c;
                                }
                            }
                            li:hover p{
                                color: #3282fb
                            }
                        }
                    }

                }
                
            }
            .right {
                flex: 1;
                .right_head {
                    padding: 14px 24px;
                    border-bottom: 1px solid #eaeaea;
                    display: flex;
                    justify-content: space-between;
                    .head_left {
                        width: 280px;
                    }
                    .head_right {
                        .right_title {
                            margin-right: 9px;
                            font-size: 12px;
                            color: #969696;
                        }
                    }
                }
                .main_wrap {
                    width: 100%;
                    height: 511px;
                    overflow: hidden;
                    position: relative;
                    padding: 10px;
                    .main_box {
                        width: 100%;
                        height: 100%;
                    }
                    .Rankingtips {
                        width: 300px;
                        height: 30px;
                        padding-left: 20px;
                        // background: red;
                        position: absolute;
                        bottom: 30px;
                        left: 0;
                        p {
                            font-size: 12px;
                            color: #3c3c3c;
                        }
                        .color_tip {
                            span {
                                color: #969696;
                                font-size: 12px;
                            }
                            div {
                                float: left;
                                margin-left: 5px;
                                width: 10px;
                                height: 10px;
                                margin-top: 5px;
                                &:nth-of-type(1) {
                                    background: #1669e6;
                                }
                                &:nth-of-type(2) {
                                    background: #31a4ed;
                                }
                                &:nth-of-type(3) {
                                    background: #2cccfd;
                                }
                                &:nth-of-type(4) {
                                    background: #7fe2fd;
                                }
                                &:nth-of-type(5) {
                                    background: #d9f4fe;
                                }
                            }
                        }


                    }
                }
                .echartws_label {
                    width: 300px;
                    height: 300px;;
                }
            }
        }
    }
</style>
<style>
.el-input__inner {
    height: 28px;
    line-height: 28px;
}
.el-input__icon {
    line-height: 28px;
}
.el-select .el-input__inner {
    border-radius: 15px;
}
</style>
