function search(target) {
    $.ajax({
        type: "POST",
        contentType : 'application/json',
        url: "http://ec2-15-164-32-179.ap-northeast-2.compute.amazonaws.com:8080/SearchSigungu",
        data: JSON.stringify({SiGunGu: $("#addressInput").val()}),
        dataType:'json',
        success: function(data) {
            var checkWord = document.getElementById("addressInput").value;
            var addressList = document.getElementById("addressList");
            
            listVisibility(addressList, target);
            addressList.replaceChildren();
            
            // data가 일치하지 않는 경우
            // 여기선 data가 null이 아닌 []값이기 때문에
            // 조건을 !data가 아닌 ""으로 작성함
            if (data == ""){
                const noResult = document.createElement("div");
                noResult.insertAdjacentHTML('beforeend',`<div class='no-result' style='font-size: 12px;'>검색 결과가 없습니다.</div>`)
                addressList.append(noResult);
            }
            else{
                data.forEach((address)=>{
                    if(address.name.includes(checkWord)){
                        const temp = document.createElement("div");
                        temp.insertAdjacentHTML('beforeend', `<div class="address" style="font-size: 12px; padding-top: 15px; border-bottom: 1px solid; height: 50%; width: 90%; cursor: pointer;" onclick="select(this);"> ${address['name']} </div> <br/>`);
                        addressList.append(temp);
                    }
                });
            }
            
            enterKey(target);
            
        },
        error:function(request, status, error){
            console.log("code: " + request.status)
            console.log("message: " + request.responseText)
            console.log("status: " + status)
            console.log(error)
        }   
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