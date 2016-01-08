(function(){

    var user;
    var user_name;
    var messages = [];
    var first_connection = 0;
    var chat_me;
    var chat_you;
    var ajax_id;
    var ajax_usertype;

    var all_users = ['raghav', 'rajeev', 'ramesh'];
    var all_dealers = ['dealer1', 'dealer2', 'dealer3', 'dealer4', 'dealer5', 'dealer6', 'dealer7', 'dealer8', 'dealer9', 'dealer10'];

    //
    $('.page_div').hide();

    //$('#login').show();
    //$('#message_list').show();
    //$('#chatroom').show();

    function login() {
        if(window.localStorage["username"] != undefined && window.localStorage["password"] != undefined && window.localStorage["user_type"] != undefined) 
        {
            if(window.localStorage["user_type"] != "") {
                if(window.localStorage["username"] != "" && window.localStorage["password"] != ""){ 

                    if(window.localStorage["user_type"] == "user") {
                        for (var i = 0; i < all_users.length; i++) {
                            if(window.localStorage["username"] == all_users[i] ) {
                                ajax_id = i + 1;
                                ajax_usertype = "user";

                                start_connection();
                                //var conn = new WebSocket('ws://localhost:8080');
                                ajax_call();
                            } else {
                                $('#login').show();
                            }
                        }
                    } else if(window.localStorage["user_type"] == "dealer") {
                        for (var i = 0; i < all_dealers.length; i++) {
                            if(window.localStorage["username"] == all_dealers[i] ) {
                                ajax_id = i + 1;
                                ajax_usertype = "dealer";

                                start_connection();
                                //var conn = new WebSocket('ws://localhost:8080');
                                ajax_call();
                            } else {
                                $('#login').show();
                            }
                        }
                    } else {
                        $('#login').show();
                    }

                } else {
                    $('#login').show();
                }
            } else {
                $('#login').show();
            }
        } else {
            $('#login').show();
        }
    }

    function ajax_call() {
        var dataString = "id=" + ajax_id + "&user_type=" + ajax_usertype;

        $.ajax({
            type: "GET",
            //url: 'http://localhost:8888/app/chat', 
            url: 'http://ec2-54-169-16-17.ap-southeast-1.compute.amazonaws.com/app/chat',  
            dataType: 'jsonp',                 // Using jsonp to avoid crossdomain problems e.g. www.site.com vs site.com
            data: dataString,
            cache: true,  
            success: function(response) {
                if(response) {

                    if(response.error == 1) {  // handle errors
                        
                        console.log(response.in_chat_dealers);
                        $('#login').show();

                    } else {

                        if (window.localStorage["user_type"] == "user") {
                            var img = '<img class="chat_face" src="images/user.jpg" alt="user image">';

                            var text = '<img class="chat_face" src="images/user.jpg" alt="user image">';
                            text += '<span>'+ window.localStorage["username"] +'</span>';
                        } else {
                            var img = '<img class="chat_face" src="images/dealer.jpg" alt="user image">';

                            var text = '<img class="chat_face" src="images/dealer.jpg" alt="user image">';
                            text += '<span>'+ window.localStorage["username"] +'</span>';
                        }

                        $('.user_details').html(text);

                        //for the list of participants
                        var chat_rooms = [];
                        var i=0;
                        $(response.chat_rooms).each(function(index, chat_room) {
                            chat_rooms[i] = [chat_room['id'], chat_room['dealer_id'], chat_room['user_id']];
                            /*chat_rooms[i][0] = chat_room['id'];
                            chat_rooms[i][1] = chat_room['dealer_id'];
                            chat_rooms[i][2] = chat_room['user_id'];*/

                            i++;
                        });

                        var i=0;
                        var chat_participants = [];
                        var participants = '';
                        $(response.in_chat_participants).each(function(index, participant) {
                            participants += '<div class="row" data-chatroom="'+ chat_rooms[i][0] +'">';
                            
                            participants += '<div class="col-xs-2">' + img + '</div>';

                            participants += '<div class="col-xs-8">';
                            participants += '<span class="chat_participant" data-participantid="' + participant['id'] + '"><strong>' + participant['name'] + '</strong></span> <br>';
                            
                            participants += '<span class="bid_description">Need 50 bags of Acc Cement</span><span class="badge"></span></div></div>';

                            chat_participants[i] = [participant['id'], participant['name']];

                            i++;
                        });

                        $('.participants').html(participants);

                        //for chat messages
                        var i=0;
                        var messages = '';
                        $(response.chat_room_messages).each(function(index, chat_room_message) {

                                messages += '<div class="chat_inner_wrapper" data-chatroom="'+ chat_rooms[index][0] +'"><div class="chat_header">';
                                       
                                messages += '<button class="back">Back</button><h4 class="chat_user_name">'+ chat_participants[index][1] +'</h4>';
                                messages += '<h5 class="chat_requirement_desc">Need 50 bags of Acc Cement</h5></div><div class="chat_box">';

                                $(chat_room_message).each(function(index, message) {

                                    if (window.localStorage["user_type"] == "user") {
                                        if(message['to_id'] == 1) {
                                            
                                            messages += '<div class="row chat_individual_me"><div class="col-sm-8 chat_individual_text chat_me">';
                                            messages += '<p>'+ message['chat_message'] +'</p></div></div>';

                                        } else {

                                            messages += '<div class="row chat_individual_you"><div class="col-sm-8 chat_individual_text chat_you">';
                                            messages += '<p>'+ message['chat_message'] +'</p></div></div>';

                                        }

                                    } else {

                                        if(message['to_id'] == 0) {
                                            
                                            messages += '<div class="row chat_individual_me"><div class="col-sm-8 chat_individual_text chat_me">';
                                            messages += '<p>'+ message['chat_message'] +'</p></div></div>';

                                        } else {
                                            
                                            messages += '<div class="row chat_individual_you"><div class="col-sm-8 chat_individual_text chat_you">';
                                            messages += '<p>'+ message['chat_message'] +'</p></div></div>';

                                        }

                                    }
                                });

                                    messages += '</div></div>';

                        });
                    
                        $('.chat_outer_wrapper').html(messages);
                        
                        $('#login').hide();
                        $('#message_list').show();

                    }
                }
            }, error: function(xhr){
                console.log('Request Status: ' + xhr.status + ' Status Text: ' + xhr.statusText + ' ' + xhr.responseText);
            }
        });
    }

    //on submit login form
    $('.login_button').click(function(e) {

        e.preventDefault();

        window.localStorage["username"] = $('.username').val();
        window.localStorage["password"] = $('.password').val();
        window.localStorage["user_type"] = $("input:radio[name=user_type]:checked").val();

        login();
    });

    $(document).on('click', '.back', function() {
        if($('#chatroom').is(':visible')) {
            //$('#login').show();
            $('#chatroom').hide();
            $('#message_list').show();
        } else if($('#message_list').is(':visible')) {
            $('#message_list').hide();
            $('#login').show();
        } else {

        }
    });

    function updateMessages(msg){
        messages.push(msg);
        //console.log(msg);
        //var messages_html = messages_template({'messages': messages});
        //$('#messages').html(messages_html);
        //$("#messages").animate({ scrollTop: $('#messages')[0].scrollHeight}, 1000);
    }

    var conn;

    function start_connection() {
        //conn = new WebSocket('ws://localhost:8080');
        conn = new WebSocket('ws://ec2-54-169-16-17.ap-southeast-1.compute.amazonaws.com:8080');

        conn.onopen = function(e) {
            console.log("Connection established!");

            var user_dealer_id = ajax_id;
            var user_type = ajax_usertype;
            var msg_type = "store_connection";

            //send the user/dealer id, chatroom id
            var msg = {
                'id': user_dealer_id,
                'user_type': user_type,
                'msg_type': msg_type
            };

            conn.send(JSON.stringify(msg));
        };

        conn.onmessage = function(e) {
            var msg = JSON.parse(e.data);

            var chatroom_id = msg.chatroom_id;
            
            var text = msg.text;

            chat_you = $('.chat_individual_you .col-sm-2').html();

            chat_you = '<div class="row chat_individual_you"><div class="col-sm-8 chat_individual_text chat_you"><p>' + text + '</p></div></div>';

            console.log(chat_you);
            $(".chat_inner_wrapper[data-chatroom='"+chatroom_id+"']").find('.chat_box').append(chat_you);

            //add message received notification
            if ( $('.active_chat').attr('data-chatroom') != chatroom_id ) {
                var new_message_count = $(".message_list .row[data-chatroom='"+chatroom_id+"']").find('.badge').text();
                if(new_message_count == '') {
                    new_message_count = 0;
                } else {
                    new_message_count = parseInt(new_message_count);
                }
                new_message_count++;

                $(".message_list .row[data-chatroom='"+chatroom_id+"']").find('.badge').text(new_message_count);
            }


            updateMessages(msg);
        };
    }

    //initiate the chat. open connection.
    $("#chat_new_message").focus(function(){
        if(first_connection == 0) {
            first_connection = 1;

            user = $('.current_user').attr('data-id');
            user_name = $('.current_user').text();

            var msg = {
                'user': user,
                'text': user_name + ' is online',
                'time': moment().format('hh:mm a')
            };

            //conn.send(JSON.stringify(msg));
        }
    });


    $('.btn_send').click(function(){
        var text = $('#chat_new_message').val();
        //var participant_id = $('.active_chat .chat_participant').attr('data-participantid');
        var user_type = ajax_usertype;

        if(user_type == "user") {
            for (var i = 0; i < all_dealers.length; i++) {
                if($('.chat_user_name:visible').text().toLowerCase() == all_dealers[i] ) {
                    var participant_id = i + 1;
                    
                }
            }
        } else {
            for (var i = 0; i < all_users.length; i++) {
                if($('.chat_user_name:visible').text().toLowerCase() == all_users[i] ) {
                    var participant_id = i + 1;
                    
                }
            }
        }

        if(user_type == 'user') {
            var participant_type = 'dealer';
        } else {
            var participant_type = 'user';
        }

        var chatroom_id = $('.chat_inner_wrapper:visible').attr('data-chatroom');

        var msg = {
            'participant_type': participant_type,
            'participant_id': participant_id,
            'chatroom_id': chatroom_id,
            'text': text,
            'msg_type': "new_message",
            'time': moment().format('hh:mm a')
        };

        chat_me = $('.chat_individual_me .col-sm-2').html();

        chat_me = '<div class="row chat_individual_me">';

        chat_me += '<div class="col-sm-8 chat_individual_text chat_me"><p>'+ text +'</p></div></div>';

        console.log(chat_me);
        $(".chat_inner_wrapper[data-chatroom='"+chatroom_id+"']").find('.chat_box').append(chat_me);

        updateMessages(msg);
        conn.send(JSON.stringify(msg));

        $('#chat_new_message').val('');
    });


    $('.close_chat').click(function(){

        var msg = {
            'user': user,
            'text': user + ' has left the room',
            'time': moment().format('hh:mm a')
        };
        updateMessages(msg);
        conn.send(JSON.stringify(msg));

        $('#messages').html('');
        messages = [];

        $('#main-container').addClass('hidden');
        $('#user-container').removeClass('hidden');

        conn.close();
    });

    window.onbeforeunload = function() {
        /*var msg = {
            'user': user,
            'text': user + ' has left the room',
            'time': moment().format('hh:mm a')
        };
        updateMessages(msg);
        conn.send(JSON.stringify(msg));

        $('#messages').html('');
        messages = [];

        $('#main-container').addClass('hidden');
        $('#user-container').removeClass('hidden');*/

        conn.close();
    };

    //changing the chatroom
    $(document).on('click', '.participants .row', function(){
        $('#message_list').hide();
        $('#chatroom').show();

        var current_chatroom = $(this).attr('data-chatroom');

        $(".chat_inner_wrapper").hide();
        $(".chat_inner_wrapper[data-chatroom='"+current_chatroom+"']").show();
    });

    //
    $(".chat_inner_wrapper").not(":eq(0)").hide();

    login();
})();