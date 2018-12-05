window.onload = function() {
    //  오토 포커스 실행
    document.getElementById('title').focus();

    //  로더 숨기기
    $('#loader').hide();

    //  취소 버튼 시 팝업 창 종료
    document.getElementById('Cancel').addEventListener('click',function(){
        window.close();
    });
    //  일정 추가시 캘린더에 일정 추가 후 팝업 창 종료
    document.querySelector('#complete_btn').addEventListener('click', function() {
        //  로더 활성화
        $('#loader').show();

        //  예외처리
        if(exceptionCheck()){
            //  주의!! manifest.json 파일의 scopes가 비어있는 값이면 오류발생함
            chrome.identity.getAuthToken({interactive: true}, function(token){addSchedule(token);});
        } else{
            //  로더 숨기기
            $('#loader').hide();

            //  메시지 출력 
            if(!$('#eMsg').is(':visible'))
                $('#eMsg').transition('fade');
        }
    });

    //  시작-종료 날짜 입력
    $('#start').calendar({
        type: 'datetime',
        ampm: false,
        monthFirst: false
    });
    $('#end').calendar({
        type: 'datetime',
        ampm: false,
        monthFirst: false
    });

    //  메시지 닫는 기능
    $('#close').on('click',function(){
        $(this)
            .closest('#eMsg')
            .transition('fade');
    });
    $('#close2').on('click',function(){
        $(this)
            .closest('#eMsg2')
            .transition('fade');
    });

    //  화면 리사이즈 감지
    setInterval(popupResize, 250);
}

//  예외처리
function exceptionCheck(){
    if( document.getElementById('title').value &&
        $('#start').calendar('get date') &&
        $('#end').calendar('get date')){
        return true;
    } else{
        return false;
    }
}

//  일정 추가 
function addSchedule(token){
    console.log(token);
    
    //  시작 날짜 종료 날짜 분류
    var st = $('#start').calendar('get date') + "";
    var et = $('#end').calendar('get date') + "";

    var stArray = st.split(' ');
    var etArray = et.split(' ');
    
    stArray[1] = monthConvert(stArray[1]);
    etArray[1] = monthConvert(etArray[1]);
    
    //  알람 설정
    var selReminder = reminderCheck();

    //  post로 요청
    fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events?"+
            "sendUpdates=all&key=AIzaSyDsyAyx4zEUsErwp__HN5yUnmmcekuMj28", 
        {  
            method: 'POST',  
            async: true,
            headers: {
                Authorization: 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            'contentType': 'json',
            body: JSON.stringify({
                "start":
                {
                    "dateTime": stArray[3] + "-" + stArray[1] + "-" + stArray[2] + "T" + stArray[4] + "+09:00"
                },
                "end":
                {
                    "dateTime": etArray[3] + "-" + etArray[1] + "-" + etArray[2] + "T" + etArray[4] + "+09:00"
                },
                "colorId":"1",
                "visibility":"default",
                "reminders": selReminder,
                "description": document.getElementById('desc').value,
                "summary": document.getElementById('title').value
            })
        }
    )
    .then(function (data) {  
        console.log('Request success: ', data.status);
        
        if(data.status != 200){
            if(data.status == 401)
                throw "token expired";
            else
                throw "Request / Response Error";
        } else{
            console.log("뭐지");
            window.close();
        }
    })  
    .catch(function (error) {  
        console.log('Request failure: ', error);

        if(error == "token expired"){
            chrome.identity.removeCachedAuthToken({token: token},function(){
                chrome.identity.getAuthToken({interactive: true},function(token){addSchedule(token);});
            });
        } else{
            //  로더 숨기기
            $('#loader').hide();

            //  메시지 출력
            if(!$('#eMsg2').is(':visible'))
                $('#eMsg2').transition('fade');
        }
    });
}

//  알람 요청 조건에 따라 설정
function reminderCheck(){
    var rArray = document.getElementsByName('reminder');

    var selReminder = rArray[0];

    for(var i = 0; i < rArray.length; i++){
        if(rArray[i].checked){
            selReminder = rArray[i];
        }
    }

    switch(selReminder.id){
        case "none":
            selReminder = {
                "useDefault": true
            }
            break;
        case "popup":
            selReminder = {
                "useDefault": false,
                "overrides": [
                    {
                        "method": "popup",
                        "minutes": document.getElementById('minute').value ? document.getElementById('minute').value : '0'
                    }
                ]
            }
            break;
        case "email":
            selReminder = {
                "useDefault": false,
                "overrides": [
                    {
                        "method": "email",
                        "minutes": document.getElementById('minute').value ? document.getElementById('minute').value : '0'
                    }
                ]
            }
            break;
        case "both":
            selReminder = {
                "useDefault": false,
                "overrides": [
                    {
                        "method": "popup",
                        "minutes": document.getElementById('minute').value ? document.getElementById('minute').value : '0'
                    },
                    {
                        "method": "email",
                        "minutes": document.getElementById('minute').value ? document.getElementById('minute').value : '0'
                    }
                ]
            }
            break;
    }

    return selReminder;
}

//  알파벳 month를 숫자로 변환
function monthConvert(month){
    switch(month){
        case 'Jan':
            month = '1';
            break;
        case 'Feb':
            month = '2';
            break;
        case 'Mar':
            month = '3';
            break;
        case 'Apr':
            month = '4';
            break;
        case 'May':
            month = '5';
            break;
        case 'Jun':
            month = '6';
            break;
        case 'Jul':
            month = '7';
            break;
        case 'Aug':
            month = '8';
            break;
        case 'Sep':
            month = '9';
            break;
        case 'Oct':
            month = '10';
            break;
        case 'Nov':
            month = '11';
            break;
        case 'Dec':
            month = '12';
            break;
    }

    return month;
}

//  내용 크기 변화 시 팝업 창 리사이즈
function popupResize(){
    if($('html').height() != $('#container').height() ||
        $('html').width() != $('#container').width()){
        $('html').height($('#container').height());
        $('html').width($('#container').width());
    }
}