// 마커를 담을 배열입니다
var markers = [],

    // 커스텀 오버레이를 담을 변수입니다
    overlay = null,

    // 매매 데이터를 저장할 변수입니다
    sales = "",

    // 아파트 준공일을 저장할 변수입니다
    buildYear = "",

    // 매매 평균가 및 상승률/하락률을 저장할 배열입니다
    avgSales = [],

    // 지번을 저장할 변수입니다
    jibun = "",

    // input 값이 달라질 때 아파트 리스트 목록의 idx를 초기화하고 이전 idx를 저장합니다
    idx = -1,
    prevIdx;

var mapContainer = document.getElementById('map'), // 지도를 표시할 div 
    mapOption = { 
        center: new kakao.maps.LatLng(36.64337930293626, 127.8115602377885), // 지도의 중심좌표
        level: 13 // 지도의 확대 레벨
    };

// 지도를 생성합니다    
var map = new kakao.maps.Map(mapContainer, mapOption); 

// 장소 검색 객체를 생성합니다
var ps = new kakao.maps.services.Places(); 

    // 마커 클러스터러를 생성합니다 
var clusterer = new kakao.maps.MarkerClusterer({
    map: map, // 마커들을 클러스터로 관리하고 표시할 지도 객체 
    averageCenter: true, // 클러스터에 포함된 마커들의 평균 위치를 클러스터 마커 위치로 설정 
    minLevel: 10, // 클러스터 할 최소 지도 레벨 
    disableClickZoom: true
});

// 지도 확대, 축소 컨트롤에서 확대 버튼을 누르면 호출되어 지도를 확대하는 함수입니다
function zoomIn() {
    map.setLevel(map.getLevel() - 1);
}

// 지도 확대, 축소 컨트롤에서 축소 버튼을 누르면 호출되어 지도를 확대하는 함수입니다
function zoomOut() {
    if(map.getLevel() + 1 < 14){
        map.setLevel(map.getLevel() + 1);
    }
}

// 검색
function search(target) {    
    var addressInput = document.getElementById("addressInput");
        
    if(target.isComposing || target.keyCode == 8){
        setTimeout(() => {
            if(!addressInput.value){
                var addressList = document.getElementById("addressList"),
                    clearBtn = document.querySelector(".btn-clear > i");
                    
                addressList.style.visibility = "hidden";
                clearBtn.style.visibility = "hidden";
    
                return;
            }
    
            $.ajax({
                type: "POST",
                contentType : 'application/json',
                url: "http://ec2-13-125-143-90.ap-northeast-2.compute.amazonaws.com:8080/searchAddress",
                data: JSON.stringify({SiGunGu: addressInput.value}),
                dataType:'json',
                success: function(data) {
                    var addressList = document.getElementById("addressList"),
                        fragment = document.createDocumentFragment();
    
                    // 검색 결과 목록에 추가된 것들을 제거합니다
                    removeAllChildNods(addressList);
        
                    // 검색창에 입력이 되었을 때 검색 목록이 보입니다
                    listVisibility(addressList, target);                
                        
                    // 검색 결과 없을 때 검색 결과가 없다고 나타냅니다
                    if(data == "") {
                        var noResult = document.createElement("div");
                            
                        noResult.insertAdjacentHTML('beforeend',`<div class='no-result' style='font-size: 14px; font-weight:bolder;'>검색 결과가 없습니다.</div>`)
                        fragment.append(noResult);
                    }
        
                    // 지역 및 아파트 검색 결과 있을 때 
                    else {
                        for(var i=0; i<data.length; i++) {
                            var itemEl = getListItem(data[i]);
                            fragment.append(itemEl);
                        }
                    }

                        
                    addressList.append(fragment);         
                },
                fail: function(data) {
                    console.log(data.responseText);
                    fail(error);
                }
            });
            idx = -1;
        }, 300);
    }

    if(!target.isComposing){ keyboardHandle(target); }
}

// 검색 목록 방향키로 이동
function keyboardHandle(target) {
    var listItems = document.getElementsByClassName("info"),
        content = document.getElementById("addressList");
    
    if(target.keyCode == 40 && target.key == 'ArrowDown') {
        prevIdx = idx;
        idx++;
        
        if(idx >= listItems.length) {
            idx = prevIdx;
            return;
        }

        if(idx > 0) {
            content.scrollTop += 70;
        }

        listItems[idx].classList.add("selected");
        
        if(prevIdx >= 0 ) {
            listItems[prevIdx].classList.remove("selected");
        }
    }

    else if(target.keyCode == 38 && target.key == 'ArrowUp') {
        prevIdx = idx;
        idx--;
        content.scrollTop -= 70;

        if(idx < 0) {
            idx = -1;
            return;
        }

        listItems[idx].classList.add("selected");
        listItems[prevIdx].classList.remove("selected");
    }
    
    if (target.keyCode == 13 && target.key == 'Enter') { find(idx); }
}

// 아파트 매매 정보
function salesData(data) {
    let location_name = data;
    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: "http://ec2-13-125-143-90.ap-northeast-2.compute.amazonaws.com:8080/InfoBuilding",
        data: JSON.stringify({
            SiGunGu: data,
            startDate: "202311",
            endDate: "202312"
        }),
        dataType: "json",
        success: function(apts) {
            var inputText = document.getElementById("addressInput").value;
            let aptsInfo = [];
                
            // 시군구로 검색했을 때
            if(data === inputText){
                if(apts.length) { 
                    // Promise 배열 생성
                    let promises = [],
                        tmp = [];
                        
                    // 지도에 표시되고 있는 마커를 제거합니다
                    removeMarker();
                        
                    // 매매 검색 결과에 추가된 아파트 이름을 제거합니다
                    removeAllChildNods(aptInfo);

                    // 매매 검색 결과 목록에 추가된 항목들을 제거합니다
                    removeAllChildNods(salesList);

                    // 매매 평균가 정보를 제거합니다
                    removeAllChildNods(avgList);

                    // 오버레이를 제거합니다
                    if(overlay) {closeOverlay();}

                    // 매매 정보창을 닫습니다
                    closeInfo();

                    apts.forEach((addr)=>{
                        let roadAddr = addr.roadName.split(' '),
                            roadNum = roadAddr[1].split('-').map(value => Number(value));
                            road = `${roadAddr[0]} ${roadNum[0]} ${roadNum[1]}`;

                        // 각 ps.keywordSearch() 호출을 Promise로 감싸서 배열에 저장
                        let promise = new Promise((resolve, reject) => {
                            ps.keywordSearch(road, function(result, status) {
                                if (status == kakao.maps.services.Status.OK) {  
                                    let filteredResults = result.filter(data => data.category_name.match(/주거시설/));
                                    filteredResults.forEach(data => tmp.push({
                                        apt: data.place_name.replace(/아파트/, ""), 
                                        road_addr: data.road_address_name, 
                                        x: data.x, 
                                        y: data.y
                                    }));
                                        
                                    resolve(); // Promise 완료
                                } 
                                else {
                                    reject(); // Promise 실패
                                }
                            });
                        });
                        promises.push(promise);
                    });

                    // 모든 Promise가 완료될 때까지 기다린 후에 aptsInfo 출력
                    Promise.all(promises)
                        .then(() => {

                            // 중복 제거를 해줍니다
                            // 같은 주소에 아파트가 다른 경우가 있기 때문입니다
                            // 예) 개포주공6단지, 개포주공7단지
                            aptsInfo = Array.from(new Set(tmp.map(item => JSON.stringify(item)))).map(item => JSON.parse(item));

                            // 지도를 재설정할 범위정보를 가지고 있을 LatLngBounds 객체를 생성합니다
                            let bounds = new kakao.maps.LatLngBounds();

                            aptsInfo.forEach((data)=>{
                                var aptsPosition = new kakao.maps.LatLng(data.y, data.x),
                                    marker = addMarker(aptsPosition);
                                    
                                (function(marker) {
                                    kakao.maps.event.addListener(marker, 'mouseover', function() {
                                        displayInfowindow(aptsPosition, data);
                                    });

                                    kakao.maps.event.addListener(marker, 'mouseout', function() {
                                        closeOverlay();
                                    });

                                    kakao.maps.event.addListener(marker, 'click', function() {
                                        document.getElementById("addressInput").value = data.apt;
                                        salesData(location_name);
                                    });
                                })(marker, data, aptsPosition);

                                // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
                                // LatLngBounds 객체에 좌표를 추가합니다
                                bounds.extend(aptsPosition);
                            })

                            // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
                            map.setBounds(bounds);
                        })
                        .catch((error) => {
                            console.error('Failed:', error);
                        });
                }
                    
                // 해당 연도 및 당월 매매 데이터가 존재하지 않을 때
                else {
                    alert("당월 매매 데이터가 존재하지 않습니다.");
                }
            }

            // 아파트명으로 검색했을 때
            else{
                // 오버레이를 제거합니다
                if(overlay) {closeOverlay();}     

                for(var i=0; i<apts.length; i++) {
                    if(apts[i].aptName === inputText) {
                        // 지번을 저장합니다
                        jibun = apts[i].dong + ' ' + apts[i].bonBun_BuBun;

                        // 매매 데이터를 저장합니다
                        sales = apts[i].salesList;
                            
                        // 아파트 준공일을 저장합니다
                        buildYear = apts[i].buildYear;

                        // 매매 평균가를 저장합니다
                        avgSales.push(apts[i].prevAverage, apts[i].nowAverage, apts[i].upDownPercent);
                            
                        // 장소검색 객체를 통해 키워드로 장소검색을 요청합니다
                        ps.keywordSearch(jibun, placesSearchCB);
                    }
                }
            }
            
        },
        fail:function(apts){
            fail(apts);
            console.log(apts.responseText);
        }   
    });
}

// 검색 목록을 클릭했을 때
function select(target) {
    var hideList = document.getElementById("addressList"),
        inputText = document.getElementById("addressInput"),
        apt_name = target.querySelector('.apt'),
        located_name = target.querySelector('.located-name');
    
    // 리스트에서 선택한 요소를 input창에 넣는다
    inputText.value = apt_name.innerText

    // 매매 데이터 출력 및 카카오맵 API 실행
    salesData(located_name.innerText);

    // 클릭 시 검색 목록 사라지게 한다
    hideList.style.visibility = 'hidden';
}

// 검색 버튼 & Enter 클릭 시
function find(index) {
    var aptWrap = document.querySelectorAll(".info"),
        inputText = document.getElementById("addressInput"),
        hideList = document.getElementById("addressList");
        
    // 검색 결과가 있는 경우에만 실행
    // 일치하는 값이 없는 경우는 apt_name의 값은 null임
    // 위의 search함수에서 data 값과는 다름
    if (aptWrap && hideList.style.visibility == "visible") {
        var aptName = "",
            locatedName = "";

        if(index < 0) {
            aptName = aptWrap[0].querySelector(".apt").innerText;
            locatedName = aptWrap[0].querySelector(".located-name").innerText;
        }
        else {
            aptName = aptWrap[index].querySelector(".apt").innerText;
            locatedName = aptWrap[index].querySelector(".located-name").innerText;
        }
        
        // 아파트 이름 input 창에 넣습니다
        inputText.value = aptName;

        // 매매 데이터 검색 및 카카오맵 API 실행
        salesData(locatedName);

        hideList.style.visibility = "hidden";
        idx = -1;
    }

}

// 검색창 X버튼 클릭했을 때
function del() {
    var addressList = document.getElementById("addressList"),
        addressInput = document.getElementById("addressInput"),
        clearBtn = document.querySelector(".btn-clear > i");
    
    idx = -1;
    addressList.value = "";
    addressInput.value = "";
    clearBtn.style.visibility = "hidden";
    
    if (addressList.style.visibility == "visible") {
        addressList.style.visibility = "hidden";
    }
}


// 검색할 때만 검색 목록 표시
function listVisibility(listStatus, e){
    var clearBtn = document.querySelector(".btn-clear > i");

    if(listStatus && e.isComposing){
        listStatus.style.visibility = "visible";
        clearBtn.style.visibility = "visible";
    }
}

// 키워드 검색 완료 시 호출되는 콜백함수 입니다
function placesSearchCB (data, status) {
    
    if (status === kakao.maps.services.Status.OK) {
        displayApts(data);
    } 
    else if (status === kakao.maps.services.Status.ZERO_RESULT) {
        alert('검색 결과가 존재하지 않습니다.');
        return;

    } 
    else if (status === kakao.maps.services.Status.ERROR) {

        alert('검색 결과 중 오류가 발생했습니다.');
        return;

    }
}

function displayApts(apts) {
    var bounds = new kakao.maps.LatLngBounds(),
        aptInfo = document.getElementById("aptInfo"),
        salesList = document.getElementById("salesList"),
        avgList = document.getElementById("avgList");

    // 지도에 표시되고 있는 마커를 제거합니다
    removeMarker();
    
    // 매매 검색 결과에 추가된 아파트 이름을 제거합니다
    removeAllChildNods(aptInfo);

    // 매매 검색 결과 목록에 추가된 항목들을 제거합니다
    removeAllChildNods(salesList);

    // 매매 평균가 정보를 제거합니다
    removeAllChildNods(avgList);

    for(var i=0; i<apts.length; i++){
        
        // 주거시설이 아파트인 곳만 지도에 표시
        if(apts[i].category_name.match(/주거시설/)) {
            
            // 마커를 생성하고 지도 위에 표시합니다
            var aptPosition = new kakao.maps.LatLng(apts[i].y, apts[i].x),
                marker = addMarker(aptPosition),
                aptItems = getAptInfo(apts[i].place_name, buildYear),
                avgItems = getAvgInfo(avgSales),
                randNum = Math.floor(Math.random() * 4) + 1,
                saleItems = "";
            
            if(Array.isArray(sales) && !sales.length) {
                saleItems = getSalesInfo(sales);
                salesList.appendChild(saleItems);
            }

            else {
                sales.forEach((saleLists) => {
                    saleItems = getSalesInfo(saleLists);
                    salesList.appendChild(saleItems);
                });
            }
            
            // 아파트 사진 
            if(randNum < 3) {
                aptInfo.style.background = `url(/apt${randNum}.jpg) no-repeat bottom/cover`;
            }
            else {
                aptInfo.style.background = `url(/apt${randNum}.jpg) no-repeat center/cover`;
            }
            
            aptInfo.appendChild(aptItems);
            avgList.appendChild(avgItems);
            
            // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
            // LatLngBounds 객체에 좌표를 추가합니다
            bounds.extend(aptPosition);

            displayOverlay(aptPosition, apts[i]);

            // 마커를 클릭했을 때 커스텀 오버레이를 표시합니다
            (function(marker) {
                kakao.maps.event.addListener(marker, 'click', function() {
                    
                    // 매매 정보 화면을 가립니다
                    $('.info-container').css('display', 'block');
                    
                    // 커스텀 오버레이를 표시합니다
                    overlay.setMap(map);
                });
            })(marker);
            
            break;
        }
    }
    
    // 매매 평균가를 담은 배열을 초기화시킵니다
    avgSales = [];

    // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
    map.setBounds(bounds);
}

// 마커를 생성하고 지도 위에 표시하는 함수입니다
function addMarker(position) {
    var imageSrc = 'house.png', // 마커이미지의 주소입니다    
    imageSize = new kakao.maps.Size(40, 40), // 마커이미지의 크기입니다
    imageOption = {offset: new kakao.maps.Point(19, 40)}, // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.
    markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption),
        marker = new kakao.maps.Marker({
            map: map,
            position: position,
            image: markerImage
    });

    marker.setMap(map); // 지도 위에 마커를 표출합니다
    markers.push(marker); // 배열에 생성된 마커를 추가합니다

    return marker;
}

// 지도 위에 표시되고 있는 마커를 모두 제거합니다
function removeMarker() {
    for ( var i = 0; i < markers.length; i++ ) {
        markers[i].setMap(null);
    }   
    markers = [];
}

// 마커를 클릭했을 때 아파트에 관한 자세한 정보를 표시하는 함수입니다
function displayOverlay(position, info){
    var content = '<div class="wrap">' +
                    '<div class="info">' +
                        '<div class="title">' + 
                            info.place_name.replace(/아파트/, "") +
                            '<div class="close" onclick="closeOverlay()" title="닫기"><i class="fa-solid fa-xmark"></i></div>' +
                        '</div>' +
                        '<div class="body">' + 
                            '<div class="logImg">' +
                                '<img src="main_logo.png" width="63" height="60">' +
                            '</div>' +
                            '<div class="address">' +
                                `<div class="road">${info.road_address_name}</div>` +
                                `<div class="jibun">(지번) ${jibun.replace(/-0/, "")}<div>` +
                                `<div><a href=${info.place_url} target=_blank class=link title=클릭>카카오맵</a></div>` +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>';

    // 마커 위에 커스텀오버레이를 표시합니다
    // 마커를 중심으로 커스텀 오버레이를 표시하기위해 CSS를 이용해 위치를 설정했습니다
    overlay = new kakao.maps.CustomOverlay({
        content: content,
        position: position      
    });
}

// 시군구 검색 시 마커 위에 마우스를 올렸을 때 아파트 이름과 주소를 표시하는 함수입니다
function displayInfowindow(position, info) {
    var content = '<div class="apts-wrap">' +
                    '<div class="infos">' +
                        '<div class="title">' + info.apt.replace(/아파트/, "") + '</div>' +
                        '<div class="address">' + info.road_addr + '</div>' +
                    '</div>' +
                '</div>';

    overlay = new kakao.maps.CustomOverlay({
        content: content,
        position: position      
    });

    // 커스텀 오버레이를 표시합니다
    overlay.setMap(map);
}

// 검색결과 항목을 Element로 반환하는 함수입니다
function getListItem(places) {

    var el = document.createElement('div'),
    itemStr = '<div class="info" style="padding: 9px 7px; height: 45%; width: 90%; cursor: pointer; font-weight:bolder;" onclick="select(this);">';
                    
    if (!places.aptName) {
        itemStr += '    <span class="apt" style="font-size: 16px; font-weight:bolder;">' +  places.locatedNM  + 
                    '</span>' +
                    '   <div class="located-name" style="font-size: 12px;">' +  places.locatedNM  + '</div>'+
                    '</div>';
    }
            
    else {
        itemStr += '    <span class="apt" style="font-size: 16px; font-weight:bolder;">' +  places.aptName  + 
                    '</span>' +
                    '   <div class="located-name" style="font-size: 12px;">' +  places.locatedNM  + '</div>'+
                    '</div>';
    }

    el.innerHTML = itemStr;
    el.className = 'input-result';

    return el;
}

 // 검색결과 목록의 자식 Element를 제거하는 함수입니다
function removeAllChildNods(el) {   
    while (el.hasChildNodes()) {
        el.removeChild (el.lastChild);
    }
}

// 아파트 이름과 층 정보를 반환하는 함수입니다
function getAptInfo(title, year) {
    var el = document.createElement('div'),
        fragment = document.createDocumentFragment(),
    
         // 아파트 이름과 층 정보
        aptName = '<div class="title" style="font-size: 35px;padding-left: 10px;">' + 
                    title.replace(/아파트$/, "") + '</div>' + 
                    '<div class="buildYear" style="font-size: 20px;padding-left: 14px;">' + year + 
                    '년' + ' 준공' + '</div>';
                    
                    
        
    el.innerHTML = aptName;
    el.className = 'aptInfo-Items';
    fragment.appendChild(el)

    return fragment;
}

// 매매 정보를 반환하는 함수입니다
function getSalesInfo(tmp) {
    var el = document.createElement('li'),
        fragment = document.createDocumentFragment(),
        itemStr = "";

    if(Array.isArray(tmp) && !tmp.length) {
        itemStr = '<div class="no-result" style="padding: 10px 0;color:#be0000;">' + "당월 매매 기록이 없습니다." + '</div>';
    }
        
    else {
        // 매매일 정보
        var year = tmp.salesDate.split('-')[0].slice(-2) + '.',
            month = tmp.salesDate.split('-')[1] + '.',
            day = tmp.salesDate.split('-')[2],

            // 매매가 정보
            hundredM = (Math.floor(tmp.amount/10000) > 0) ? Math.floor(tmp.amount/10000).toString() + "억 " : "",
            tmpPrice = tmp.amount%10000,
            tenM = (tmpPrice > 0) ? tmpPrice.toLocaleString("ko-KR") : "",
            area = Math.floor(tmp.dedicatedArea);
            
        itemStr = '<div class="date" style="font-weight:lighter;">' + year + month + day + '</div>' +
                    '<div class="price" style="font-weight:bold;">' + hundredM + tenM + '</div>' +
                    '<div class="area" style="font-weight:lighter;">' + area + 'm<sup>2' + '</sup>' + '</div>' +
                    '<div class="floor" style="font-weight:lighter;">' + tmp.floor + '층' + '</div>';
    }

    el.innerHTML = itemStr;
    el.className = 'saleItem';
    fragment.appendChild(el);
        
    return fragment;
}

// 매매 평균가를 반환하는 함수입니다
function getAvgInfo(tmp) {
    var el = document.createElement('li'),
        fragment = document.createDocumentFragment(),
        itemStr = '<div class="last">';

    if(tmp[0]) {
        var lastHundred = (Math.floor(tmp[0]/10000) > 0) ? Math.floor(tmp[0]/10000).toString() + "억 " : "",
            lastTen = (tmp[0]%10000 > 0) ? (tmp[0]%10000).toLocaleString("ko-KR") : "",
            last = lastHundred + lastTen;

        itemStr += last + '</div>';
    }
    else {
        itemStr += "-----" + '</div>';
    }   

    if(tmp[1]) {
        var nowHundred = (Math.floor(tmp[1]/10000) > 0) ? Math.floor(tmp[1]/10000).toString() + "억 " : "",
            nowTen = (tmp[1]%10000 > 0) ? (tmp[1]%10000).toLocaleString("ko-KR") : "",
            now = nowHundred + nowTen;
        
            itemStr += '<div class="now">' + now + '</div>';
    }
    else {
        itemStr += '<div class="now">' + "-----" + '</div>';
    }
        
    if(tmp[2]) {
        var upDown = Math.round(tmp[2]*10000) / 100;

        if(upDown > 0) {
            itemStr += '<div class="upDown" style="color:#be0000;">' + '+' + upDown + '%' + '</div>';
        }

        if(upDown < 0) {
            itemStr += '<div class="upDown" style="color: #6495ed;">' + upDown + '%' + '</div>';
        }
        
    }
    else {
        itemStr += '<div class="upDown">' + '-----' + '</div>';
    }

    el.innerHTML = itemStr;
    el.className = 'avgItem';
    fragment.appendChild(el);

    return fragment
}

function closeInfo() {
    $('.info-container').css('display', 'none');   
}

function closeOverlay() {
    overlay.setMap(null);
}