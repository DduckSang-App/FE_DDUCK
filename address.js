// 마커를 담을 배열입니다
var markers = [],

    // 매매 데이터를 저장할 변수입니다
    sales = "",

    // 아파트 준공일을 저장할 변수입니다
    buildYear = "",

    // 매매 평균가 및 상승률/하락률을 저장할 배열입니다
    avgSales = [];

// 검색 결과 목록이나 마커를 클릭했을 때 장소명을 표출할 인포윈도우를 생성합니다
var infowindow = new kakao.maps.InfoWindow({zIndex:1});

var mapContainer = document.getElementById('map'), // 지도를 표시할 div 
    mapOption = { 
        center: new kakao.maps.LatLng(36.64337930293626, 127.8115602377885), // 지도의 중심좌표
        level: 13 // 지도의 확대 레벨
    };

// 지도를 생성합니다    
var map = new kakao.maps.Map(mapContainer, mapOption); 

// 장소 검색 객체를 생성합니다
var ps = new kakao.maps.services.Places(); 

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
    if(!KeyboardEvent.isComposing) {
        $.ajax({
            type: "POST",
            contentType : 'application/json',
            url: "http://ec2-15-164-32-179.ap-northeast-2.compute.amazonaws.com:8080/searchAddress",
            data: JSON.stringify({SiGunGu: $("#addressInput").val()}),
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
                    noResult.insertAdjacentHTML('beforeend',`<div class='no-result' style='font-size: 12px;'>검색 결과가 없습니다.</div>`)
                    fragment.append(noResult);
                }

                // 지역 및 아파트 검색 결과 있을 때 
                for(var i=0; i<data.length; i++) {
                    var itemEl = getListItem(data[i]);
                    fragment.append(itemEl);
                }
                
                addressList.append(fragment);

                enterKey(target);             
            },
            fail: function(data) {
                console.log(data.responseText);
                fail(error);
            }
        });
    }
}


// 아파트 매매 정보
function salesData(data) {
    if(!KeyboardEvent.isComposing) {
        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: "http://ec2-15-164-32-179.ap-northeast-2.compute.amazonaws.com:8080/InfoBuilding",
            data: JSON.stringify({
                SiGunGu: data,
                startDate: "202311",
                endDate: "202312"
            }),
            dataType: "json",
            success: function(apts) {
                var inputText = document.getElementById("addressInput").value;
                
                for(var i=0; i<apts.length; i++) {
                    if(apts[i].aptName === inputText) {

                        // 지번을 저장합니다
                        var jibun = data + apts[i].bonBun_BuBun;

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
            },
            fail:function(apts){
                fail(apts);
                console.log(apts.responseText);
            }   
        });
    }
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
function find() {
    var apt_name = document.querySelector(".apt"),
        located_name = document.querySelector('.located-name'),
        inputText = document.getElementById("addressInput"),
        hideList = document.getElementById("addressList");

    // 검색 결과가 있는 경우에만 실행
    // 일치하는 값이 없는 경우는 apt_name의 값은 null임
    // 위의 search함수에서 data 값과는 다름
    if (apt_name && hideList.style.visibility == "visible") {
        inputText.value = apt_name.innerText;
        
        // 매매 데이터 검색 및 카카오맵 API 실행
        salesData(located_name.innerText);

        hideList.style.visibility = "hidden";
    }

}

// 검색창 X버튼 클릭했을 때
function del() {
    var addressList = document.getElementById("addressList"),
        addressInput = document.getElementById("addressInput");
    
    addressList.value = "";
    addressInput.value = "";
    $('.btn-clear').css("visibility", "hidden");
    
    if (addressList.style.visibility == 'visible') {
        addressList.style.visibility = 'hidden';
    }
}


// 검색할 때만 검색 목록 표시
function listVisibility(target, e){
    if(target && e.isComposing){
        target.style.visibility = "visible";
        $('.btn-clear').css("visibility", "visible");
    }
}

// Enter 키 입력 시 이벤트 2번 발생 방지
function enterKey(e){
    if (!e.isComposing && e.key == 'Enter') {find();}
}


// 키워드 검색 완료 시 호출되는 콜백함수 입니다
function placesSearchCB (data, status, pagination) {
    
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
        aptInfo = document.getElementById("aptInfo-items"),
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
                marker = addMarker(aptPosition, i),
                aptItems = getAptInfo(apts[i].place_name, buildYear),
                avgItems = getAvgInfo(avgSales),
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

            aptInfo.appendChild(aptItems);
            avgList.appendChild(avgItems);
            
            // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
            // LatLngBounds 객체에 좌표를 추가합니다
            bounds.extend(aptPosition);

            (function(marker, title) {
                kakao.maps.event.addListener(marker, 'click', function() {
                    $('.info-container').css('display', 'block');
                });

                kakao.maps.event.addListener(marker, 'mouseover', function() {
                    displayInfowindow(marker, title);
                });
                kakao.maps.event.addListener(marker, 'mouseout', function() {
                    infowindow.close();
                });
        
            })(marker, apts[i].place_name);
            
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
    var marker = new kakao.maps.Marker({
        map: map,
        position: position
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

// 검색결과 목록 또는 마커를 클릭했을 때 호출되는 함수입니다
// 인포윈도우에 장소명을 표시합니다
function displayInfowindow(marker, apt){
    var content = '<div style="padding:5px;font-size:12px;">' + apt + '</div>';

    // 마커를 클릭하면 장소명이 인포윈도우에 표출됩니다
    infowindow.setContent(content);
    infowindow.open(map, marker);
}

// 검색결과 항목을 Element로 반환하는 함수입니다
function getListItem(places) {

    var el = document.createElement('div'),
    itemStr = '<div class="info" style="padding: 10px 0; height: 45%; width: 90%; cursor: pointer;" onclick="select(this);">';
                    
    if (!places.aptName) {
        itemStr += '    <span class="apt" style="font-size: 14px; font-weight:bold;">' +  places.locatedNM  + 
                    '</span>' +
                    '   <div class="located-name" style="font-size: 11px; border-bottom: 1px solid; ">' +  places.locatedNM  + '</div>'+
                    '</div>';
    }
            
    else {
        itemStr += '    <span class="apt" style="font-size: 14px; font-weight:bold;">' +  places.aptName  + 
                    '</span>' +
                    '   <div class="located-name" style="font-size: 11px; border-bottom: 1px solid; ">' +  places.locatedNM  + '</div>'+
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

// 아파트 이름과 층 정보를 반환하는 함수입니다.
function getAptInfo(title, year) {

    var el = document.createElement('li'),
        fragment = document.createDocumentFragment(),
    
         // 아파트 이름과 층 정보
        aptName = '<div class="name" style="font-size:27px;padding-left:10px;color:#fff;">' + 
                    title.replace(/아파트$/, "") + '</div>' + 
                    '<span class="buildYear" style="padding-left:14px;color:#fff;">' + year + 
                    '년' + ' 준공' + '</span>';
        
    el.innerHTML = aptName;
    el.className = 'aptItem';
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
            
        itemStr = '<div class="date">' + year + month + day + '</div>' +
                    '<div class="price">' + hundredM + tenM + '</div>' +
                    '<div class="area">' + area + 'm<sup>2' + '</sup>' + '</div>' +
                    '<div class="floor" sytle="padding-left:15px;">' + tmp.floor + '층' + '</div>';
    }

    el.innerHTML = itemStr;
    el.className = 'saleItem';
    fragment.appendChild(el);
        
    return fragment;
}

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

        itemStr += '<div class="upDown">' + upDown + '%' + '</div>';
    }
    else {
        itemStr += '<div class="upDown">' + '-----' + '</div>';
    }

    el.innerHTML = itemStr;
    el.className = 'avgItem';
    fragment.appendChild(el);

    return fragment
}