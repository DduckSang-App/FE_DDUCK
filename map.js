// var mapContainer = document.getElementById('map'), // 지도를 표시할 div 
//     mapOption = { 
//         center: new kakao.maps.LatLng(36.64337930293626, 127.8115602377885), // 지도의 중심좌표
//         level: 13 // 지도의 확대 레벨
//     };

// // 지도를 표시할 div와  지도 옵션으로  지도를 생성합니다
// var map = new kakao.maps.Map(mapContainer, mapOption); 

    
// // 마커 클러스터러를 생성합니다 
// var clusterer = new kakao.maps.MarkerClusterer({
//     map: map, // 마커들을 클러스터로 관리하고 표시할 지도 객체 
//     averageCenter: true, // 클러스터에 포함된 마커들의 평균 위치를 클러스터 마커 위치로 설정 
//     minLevel: 10 // 클러스터 할 최소 지도 레벨 
// });
 
// // 지도 확대, 축소 컨트롤에서 확대 버튼을 누르면 호출되어 지도를 확대하는 함수입니다
// function zoomIn() {
//     map.setLevel(map.getLevel() - 1);
// }

// // 지도 확대, 축소 컨트롤에서 축소 버튼을 누르면 호출되어 지도를 확대하는 함수입니다
// function zoomOut() {
//     if(map.getLevel() + 1 < 14){
//         map.setLevel(map.getLevel() + 1);
//     }
    
// }

// // 데이터를 가져오기 위해 jQuery를 사용합니다
// // 데이터를 가져와 마커를 생성하고 클러스터러 객체에 넘겨줍니다
// $.get("chicken.json", function(data) {
//     // 데이터에서 좌표 값을 가지고 마커를 표시합니다
//     // 마커 클러스터러로 관리할 마커 객체는 생성할 때 지도 객체를 설정하지 않습니다
//     var markers = $(data.positions).map(function(i, position) {
//         return new kakao.maps.Marker({
//             position : new kakao.maps.LatLng(position.lat, position.lng)
//         });
//     });

//     // 클러스터러에 마커들을 추가합니다
//     clusterer.addMarkers(markers);
// });