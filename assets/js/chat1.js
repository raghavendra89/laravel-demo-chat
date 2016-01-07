(function(){

    var user;
    var user_name;
    var messages = [];
    var first_connection = 0;
    var chat_me;
    var chat_you;

    //var messages_template = Handlebars.compile($('#messages-template').html());

    function updateMessages(msg){
        messages.push(msg);
        //console.log(msg);
        //var messages_html = messages_template({'messages': messages});
        //$('#messages').html(messages_html);
        //$("#messages").animate({ scrollTop: $('#messages')[0].scrollHeight}, 1000);
    }

    //var conn = new WebSocket('ws://localhost:8080');
    var conn = new WebSocket('wss://ec2-54-169-16-17.ap-southeast-1.compute.amazonaws.com:8080');

    conn.onopen = function(e) {
        console.log("Connection established!");

        var user_dealer_id = $('.current_user').attr('data-id');
        var user_type = $('.current_user').attr('data-usertype');
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

        chat_you = '<div class="row chat_individual_you"><div class="col-sm-8 chat_individual_text chat_you"><p>' + text + '</p></div><div class="col-sm-2">'+ chat_you +'</div></div>';

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
        var participant_id = $('.active_chat .chat_participant').attr('data-participantid');
        var user_type = $('.current_user').attr('data-usertype');

        if(user_type == 'user') {
            var participant_type = 'dealer';
        } else {
            var participant_type = 'user';
        }

        var chatroom_id = $('.active_chat').attr('data-chatroom');

        var msg = {
            'participant_type': participant_type,
            'participant_id': participant_id,
            'chatroom_id': chatroom_id,
            'text': text,
            'msg_type': "new_message",
            'time': moment().format('hh:mm a')
        };

        chat_me = $('.chat_individual_me .col-sm-2').html();

        chat_me = '<div class="row chat_individual_me"><div class="col-sm-2">' + chat_me + '</div>';

        chat_me += '<div class="col-sm-8 chat_individual_text chat_me"><p>'+ text +'</p></div></div>';

        console.log(chat_me);
        $(".chat_inner_wrapper[data-chatroom='"+chatroom_id+"']").find('.chat_box').append(chat_me);

        updateMessages(msg);
        conn.send(JSON.stringify(msg));

        $('#chat_new_message').val('');
    });


    $('#leave-room').click(function(){

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

    //changing the chatroom
    $('.message_list .row').click(function(){
        var prev_chatroom = $('.active_chat').attr('data-chatroom');

        $(".chat_inner_wrapper[data-chatroom='"+prev_chatroom+"']").hide();

        $('.message_list .active_chat').removeClass('active_chat');
        $(this).addClass('active_chat');

        var current_chatroom = $(this).attr('data-chatroom');

        $(".chat_inner_wrapper[data-chatroom='"+current_chatroom+"']").show();
    });

    //
    $(".chat_inner_wrapper").not(":eq(0)").hide();
})();