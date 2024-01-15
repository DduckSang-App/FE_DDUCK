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

                // 검색 결과 없을 때
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

function select(target) {
    var hideList = document.getElementById("addressList");
    
    $("input[type=text]").val(target.innerText);
    hideList.style.visibility = 'hidden';
}

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
        hideList.style.visibility = "hidden";
    }
}

function listVisibility(target, e){
    if(target && e.isComposing){
        target.style.visibility = "visible";
        $('.btn-clear').css("visibility", "visible");
    }
}

function enterKey(e){
    if (!e.isComposing && e.key == 'Enter') {find();}
}