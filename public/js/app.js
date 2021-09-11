var AppProcess = (function(){
    var peers_connection_ids = []
    var peers_connection = []
    var serverProcess;
    function _init(SDP_function,my_connid){
        serverProcess = SDP_function;
        my_connection_id = my_connid;
    }
    var iceConfiguration = {
        iceServers:[
            {
                urls: "stun:stun.l.google.com:19302",
            },
            {
                urls: "stun:stun1.l.google.com:19302",
            },
            
        ],
    }
    

    function setConnection(connid){
        var connection = new RTCPeerConnection(iceConfiguration);
        connection.onnegotiationneeded = async function(event) {
            await setOffer(connid);   
        }   
        connection.onicecandidate = function(event){
            if(event.candidate){
                serverProcess(JSON.stringify({icecandidate: event.candidate}),
                connid)
            }
        }
        connection.ontrack = function(event){};
        peers_connection_ids[connid] = connid;
        peers_connection[connid] = connection;
    }
    function setOffer(connid){
        var connection = peers_connection[connid];
        var offer = await connection.createOffer();
        await connection.setLocalDescription(offer);
        serverProcess(JSON.stringify({
            offer: connection.localDescription,
        }),connid)
    }
    return{
        setNewConnection:async function(connid){
            await setConnection(connid);
        }
    }
    
})

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
      socket=io.connect();
      var SDP_function = function(data,to_connid){
        socket.emit("SDPProcess",{
            message:data,
            to_connid:to_connid
        })
      }
      socket.on("connect",()=>{
          if(socket.connected){
              AppProcess.init(SDP_function,socket.id)
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
        AppProcess.setNewConnection(data.connId);

      })

    }
    function addUser(other_user_id, connId){
        var newDivId=$("#otherTemplate").clone();
        newDivId=newDivId.attr("id", connId).addClass("other");
        newDivId.find("h2").text(other_user_id);
        newDivId.find("video").attr("id", "v_"+connId);
        newDivId.find("audio").attr("id", "a_"+connId);
        newDivId.show();
        $("#divUsers").append(newDivId);
        
    }

    
    return{
        _init:function(uid,mid){
            init(uid,mid);
            
        },
    };
    
    
})();