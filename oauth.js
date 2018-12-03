window.onload = function() {
    //  취소 버튼 시 팝업 창 종료
    document.getElementById('Cancel').addEventListener('click',function(){
        window.close();
    });
    //  일정 추가시 캘린더에 일정 추가 후 팝업 창 종료
    document.querySelector('#complete_btn').addEventListener('click', function() {
        //  주의!! manifest.json 파일의 scopes가 비어있는 값이면 오류발생함
        chrome.identity.getAuthToken({interactive: true}, function(token) {
            console.log(token);
            
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
                            "dateTime":"2018-11-29T12:30:00+09:00"
                        },
                        "end":
                        {
                            "dateTime":"2018-12-01T13:00:00+09:00"
                        },
                        "colorId":"1",
                        "visibility":"default",
                        "reminders":
                        {
                            "useDefault": false,
                            "overrides":
                            [
                                {
                                    "method": "email",
                                    "minutes": 120
                                },
                                {
                                    "method": "popup",
                                    "minutes": 120
                                }
                            ]
                        },
                        "description": document.getElementById('desc').value,
                        "summary": document.getElementById('title').value
                    })
                }
            )
            .then(function (data) {  
                console.log('Request success: ', data);  
            })  
            .catch(function (error) {  
                console.log('Request failure: ', error);  
            });
        });
        window.close();
    });
    // 시작-종료 날짜 입력
    $('#start').calendar();
    $('#end').calendar();
};