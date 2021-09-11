var MyApp=(function(){
    var socket=null;
    var user_id="";
    var meeting_id="";
    function init(uid,mid){
        user_id=uid;
        meeting_id=mid;
        event_process_for_signalling_server();
    }
    
    function event_process_for_signalling_server(){
      socket=io.connect() 
      socket.on("connect",()=>{
          if(socket.connected){
              if(user_id !="" && meeting_id!=""){
                  socket.emit("userconnect",{
                      displayName:user_id,
                      meetingid:meeting_id

                  })
              }
          }
      }) 

      socket.on("inform_others_about_me", function(data){
        addUser(data.other_user_id,data.connId);

      })

    }

    return{
        _init:function(uid,mid){
            init(uid,mid);
        },
    };
})();