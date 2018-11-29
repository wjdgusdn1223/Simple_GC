window.onload = function() {
    document.querySelector('button').addEventListener('click', function() {
        //  주의!! manifest.json 파일의 scopes가 비어있는 값이면 오류발생함
        chrome.identity.getAuthToken({interactive: true}, function(token) {
            console.log(token);
            
            fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all&key=AIzaSyDsyAyx4zEUsErwp__HN5yUnmmcekuMj28", {  
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
                    "description": "테스트용이니 신경 ㄴㄴ",
                    "summary": "테스트 용 일정"
                })
            })
            .then(function (data) {  
                console.log('Request success: ', data);  
            })  
            .catch(function (error) {  
                console.log('Request failure: ', error);  
            });
        });
    });
};