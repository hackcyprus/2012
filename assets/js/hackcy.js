// ______         _    _            ___  
// | ___ \       | |  (_)          |__ \ 
// | |_/ /__  ___| | ___ _ __   __ _  ) |
// |  __/ _ \/ _ \ |/ / | '_ \ / _` |/ / 
// | | |  __/  __/   <| | | | | (_| |_|  
// \_|  \___|\___|_|\_\_|_| |_|\__, (_)  
//                              __/ |    
//                             |___/     
//
// ================
// Hack Cyprus 2012
// ================

(function(window, $) {

    "use strict";

    var permissions = "user_events, rsvp_event, publish_actions"
      , appId = "101469336666147"
      , host = "hackcyprus.com"
      , channelUrl = "http://" + host + "/channel.html"
      , eventId = "326458734111682"
      , cache = {}
      , firebase = new Firebase('http://gamma.firebase.com/alexmic/')
      , hackdb = firebase.child("hack_cyprus_2012")
      , attendees = hackdb.child("attendees")
      , $pics = $("#supporters #pics")
      , $picList = $pics.find("ul")
      , $counter = $pics.find("#counter");

    cache.attendees = [];

    attendees.on("child_added", function(snapshot) {
        var id = snapshot.name();
        cache.attendees.unshift(id);
        // If the child just added is the user on this page
        // then change the button.
        if (cache.uid != null && id == cache.uid) hasAttended(true);
        renderAttendees($picList, cache.attendees);
        if (!$pics.is(":visible")) $pics.show();
    });

    attendees.on("child_removed", function(snapshot) {
        var id = snapshot.name()
          , index = cache.attendees.indexOf(id);
        if (index > - 1) cache.attendees.splice(index, 1);
        renderAttendees(cache.attendees);
    });

    $("#i-want-this-to-happen").on("click", function() {
        FB.getLoginStatus(onStatusChange);
    });

    var onLogin = function(payload) {
        if (payload.authResponse != null) {
            // Check if user exists in Firebase and call
            // the callback setting 'exists' appropriately.
            cache.uid = payload.authResponse.userID;
            userExists(cache.uid, function(id, exists) {
                if (exists) {
                    hasAttended();
                } else {
                    attendees.child(id).set("attending");
                    FB.api("/" + eventId + "/attending", "post", function(payload) {
                        console.log(payload);
                    });
                }
            });
        } else {
            alert("an error occured");
        }
    };

    var userExists = function(userID, fn) {
        attendees.child(userID).once('value', function(snapshot) {
            var exists = (snapshot.val() != null);
            fn(userID, exists);
        });
    };

    var onStatusChange = function(payload) {
        if (payload.status != "connected") {
            FB.login(onLogin, {scope: permissions});
        } else {
            onLogin(payload);
        }
    };
      
    var init = function() {
        FB.init({
            appId: appId,
            channelUrl: channelUrl,
            status: false,
            cookie: true,
            xfbml: true
        });
    };

    var hasAttended = function(first) {
        var $btn = $("#i-want-this-to-happen");
        $btn.attr("disabled", "disabled")
            .addClass("disabled");
        if (first) {
            $btn.html("Thanks for supporting us!");
        } else {
            $btn.html("Already a supporter. Thanks again!");
        }
    };
      
    var renderAttendees = function(container, attendees) {
        $counter.html(attendees.length);
        container.empty();
        $.each(attendees.slice(0,200), function(i, id) {
            container.append($(
                  "<li class='supporter'>"
                +   "<a target='_blank' href='https://www.facebook.com/" + id + "'>"
                +     "<img src='https://graph.facebook.com/" + id + "/picture?type=square'/>"
                +   "</a>"
                + "</li>"
            ));
        });
    };

    window.fbAsyncInit = init;

})(window, jQuery);