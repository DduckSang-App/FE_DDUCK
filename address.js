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
    
    new Promise((succ, fail)=>{
        $.ajax({
            type: "POST",
            contentType : 'application/json',
            url: "http://ec2-15-164-32-179.ap-northeast-2.compute.amazonaws.com:8080/SearchSigungu",
            data: JSON.stringify({SiGunGu: $("#addressInput").val()}),
            dataType:'json',
            success: function(data) {
                const addressList = document.getElementById("addressList");
                
                listVisibility(addressList, target);                
                succ(data);
            },
            fail: function(data) {
                console.log(data.responseText);
                fail(error);
            }
        });
    
    }).then((arg)=>{

        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: "http://ec2-15-164-32-179.ap-northeast-2.compute.amazonaws.com:8080/InfoBuilding",
            data: JSON.stringify({SiGunGu: "서울특별시 강남구 역삼동"}),
            dataType: "json",
            success: function(data2) {
                var checkWord = $("#addressInput").val();

                addressList.replaceChildren();

                arg.forEach((address)=>{
                    const addIdx = document.createElement("div");
                    if(address.name.includes(checkWord)){
                        addIdx.insertAdjacentHTML('beforeend', `<div class="address" style="font-size: 12px; padding-top: 15px; border-bottom: 1px solid; height: 50%; width: 90%; cursor: pointer;" onclick="select(this);"> ${address['name']} </div> <br/>`);
                        addressList.append(addIdx);
                    }
                });

                data2.forEach((apt)=>{
                    const aptIdx = document.createElement("div");
                    if(apt.locatedNM.includes(checkWord) || apt.aptName.includes(checkWord)){
                        aptIdx.insertAdjacentHTML('beforeend', `<div class="address" style="font-size: 12px; padding-top: 15px; border-bottom: 1px solid; height: 50%; width: 90%; cursor: pointer;" onclick="select(this);"> ${apt['aptName']} </div> <br/>`);
                        addressList.append(aptIdx);
                    }
                   
                });

                if (arg == "" && data2 == ""){
                    const noResult = document.createElement("div");
                    noResult.insertAdjacentHTML('beforeend',`<div class='no-result' style='font-size: 12px;'>검색 결과가 없습니다.</div>`)
                    addressList.append(noResult);
                }

                enterKey(target);

                
            },
            fail:function(data2){
                fail(data2);
                console.log(data2.responseText);
            }   
        });
    });
}

// 검색 목록을 클릭했을 때
function select(target) {
    var hideList = document.getElementById("addressList");
    
    $("input[type=text]").val(target.innerText);
    ps.keywordSearch(target.innerText, placesSearchCB);
    hideList.style.visibility = 'hidden';
}

// X버튼 클릭했을 때
function del() {
    var addressList = document.getElementById("addressList");
    var addressInput = document.getElementById("addressInput");
    
    addressList.value = "";
    addressInput.value = "";
    $('.btn-clear').css("visibility", "hidden");

    if (addressList.style.visibility == 'visible') {
        addressList.style.visibility = 'hidden';
    }
}

// 검색 버튼 & Enter 클릭 시
function find() {
    // // class가 address인 쿼리들 중 하나만 선택
    var addressIdx = document.querySelector(".address");
    var addressInput = document.getElementById("addressInput");
    var hideList = document.getElementById("addressList");

    // 검색 결과가 있는 경우에만 실행
    // 일치하는 값이 없는 경우는 addressIdx의 값은 null임
    // 위의 search함수에서 data 값과는 다름
    if (addressIdx && hideList.style.visibility == "visible") {
        addressInput.value = addressIdx.innerText;
        // 키워드로 장소를 검색합니다
        ps.keywordSearch(addressIdx.innerText, placesSearchCB); 
        hideList.style.visibility = "hidden";
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

        // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
        // LatLngBounds 객체에 좌표를 추가합니다
        var bounds = new kakao.maps.LatLngBounds();
        
        for (var i=0; i<data.length; i++) {
            displayMarker(data[i]);    
            bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x));
        }       

        // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
        map.setBounds(bounds);
    } 
}

// 지도에 마커를 표시하는 함수입니다
function displayMarker(place) {
    
    // 마커를 생성하고 지도에 표시합니다
    var marker = new kakao.maps.Marker({
        map: map,
        position: new kakao.maps.LatLng(place.y, place.x) 
    });

    // 마커에 클릭이벤트를 등록합니다
    kakao.maps.event.addListener(marker, 'click', function() {
        // 마커를 클릭하면 장소명이 인포윈도우에 표출됩니다
        infowindow.setContent('<div style="padding:5px;font-size:12px;">' + place.place_name + '</div>');
        infowindow.open(map, marker);
    });
}