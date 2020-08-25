app_prefix = "roy_bocopy";
room_name = app_prefix + "_room";

md = "go";

// peerオブジェクト
peers = [];
keys = [
 {
//  'key':'7990b181-04e7-4bb7-aec2-25d2c53ae823',
//  'key':'871a03af-dd69-43a6-bb8b-5dee0b870ffa', //配信１
//  'key':'3d3101c2-838c-4c3d-b427-25998786d258', //配信１bkup
  'key':'b29c5d78-2f93-42b8-bb86-a35913d4856b', //mesh
  'status':0,
 },
];
rooms = [];

srcPeer = function(id){
 for(var p=0;p<peers.length;p++){
  if ( peers[p]["peer"].id == id ) {
   return p+1;
  }
 }
 return false;
}
var mcnt = 0;
memberCount = function(){
 mcnt = 0;
 for(var p=0;p<peers.length;p++){
  if ( peers[p]["status"] == 1 ) {
   peers[p].peer.listAllPeers(peers_list => {
    mcnt += peers_list.length;
    $("#label b").remove();
    $("#label").append("<b>(" + mcnt + ")</b>");
   });
  }
 }
}
initRoom = function(p){


 var _room = peers[p]["peer"].joinRoom(room_name,{mode: 'mesh', number:p});

 _room.on('open',function(data){
  $("#label span").text('ROYシステム稼働 コピー配信中');
  $("#label").css({"background":"#298c00"});
  memberCount();
 });
 // チャットを受信
 _room.on('data', function(data){

 });
 _room.on('peerLeave', function(data){
  memberCount();
 });
 _room.on('peerJoin', function(data){
  memberCount();
 });
 _room.on('close',function(data){
  //再接続
  
  if ( peers[this._options.number]["status"] == 1 ) {
   $("#label span").text('ルーム切断 再起動中...');
   $("#label").css({"background":"#ff0000"});
   void(function(r){
    setTimeout(function(){
     initRoom(r._options.number);
    },3000);
   }(this));
  }
 });
 rooms[p] = _room;

}

initPeer = function(pcnt){

  var _peer = new Peer(MP.user.username,{
   key: keys[pcnt-1]['key'], // 自分のAPIキーを入力
   debug: 0,
   number: pcnt,
  });
  
  _peer.on('open', id => {
  
   var p = srcPeer(id);
   
   if ( p == false ) {
   } else {
    p -= 1;
    peers[p]["status"] = 1;
    initRoom(p);
   }

  });
  _peer.on('disconnected', id => {
   var p = srcPeer(id);
   if ( p == false ) {
   } else {
    $("#label span").text('システム切断 再起動中...');
    $("#label").css({"background":"#ff0000"});
    p -= 1;
    peers[p]["status"] = 0;
    rooms[p].close();
    peers[p].peer.destroy();
    void(function(pn){
     setTimeout(function(){ initPeer(pn+1); }, 3000);
    }(p));
   }
  });
  
  peers[pcnt-1] = {"peer":_peer,"status":0};

}

sendMessage = function(msg){
 var i = 0;
 $(keys).each(function(){
  rooms[i].send(msg);
  i += 1;
 }); 
 
}



$("#assetsGameTypeZoneRegion").on('click','.gameTab',function(){
 var i = $("#assetsGameTypeZoneRegion .gameTab").index($(this));
 sendMessage('{"m":"g","i":' + i + '}');
});
$("#assetsCategoryFilterZoneRegion").bind('click',function(){
 var i = $("#assetsCategoryFilterZoneRegion .tab").index($("#assetsCategoryFilterZoneRegion .tab.selected"));
 sendMessage('{"m":"t","i":' + i + '}');
});
$("#tradeAreasRegion").on('click','.carousel_item',function(){
 var selitem = $("#carousel_container .carousel_item.selected");
 var i = $(selitem).find(".time-digits").text();
 var t = $(selitem).find(".duration").text();
 var p = $(selitem).find('[id="assetName"]').text();
 sendMessage('{"m":"p","i":"' + i + '","p":"' + p + '","t":"' + t + '"}');
});


otarr = {
 "ChangingStrike":{"h":2,"l":1,"i":0},
 "FixedPayoutHL":{"h":7,"l":6,"i":1},
 "ChangingStrikeOOD":{"h":2,"l":1,"i":2},
 "FixedPayoutHLOOD":{"h":7,"l":6,"i":3},
};
var d = "";
$("#tradeAreasRegion").on('mouseup','#down_button',function(){
// d = otarr[$("#assetsGameTypeZoneRegion .gameTab.selected").attr("data-game")]["l"];
// sendEntry(d);
});
$("#tradeAreasRegion").on('mouseup','#up_button',function(){
// d = otarr[$("#assetsGameTypeZoneRegion .gameTab.selected").attr("data-game")]["h"];
// sendEntry(d);
});
sendEntry = function(d){
 data = {
  "m":"e",
  "s":$("#strike").text(),
  "d":d, //direction
  "g":otarr[$("#assetsGameTypeZoneRegion .gameTab.selected").attr("data-game")]["i"], //game
  "p":$("#carousel_container .carousel_item.selected .instrument-panel-title").text().replace('/',''), //pair
  "id":$("#carousel_container .carousel_item.selected .time-digits").text(), ///cardid
  "md":md,
 };
 sendMessage(JSON.stringify(data));
 //teregram send
 if ( md == "go" ) {

  tg_game = $(".gameTab.selected span").eq(0).text();
  tg_pair = $(".carousel_item.selected div[id='assetName']").text();
  tg_dur = $.trim($(".carousel_item.selected .instrument-panel-duration").text());
  tg_close = $.trim($(".carousel_item.selected .instrument-panel-closing").text());
  tg_button = $.trim($(".subGraph-updown .button.selected").text());
  $.ajax({
      "url":"https://api.telegram.org/bot1000441737:AAHi5cqObrJPYCP1gmNsZixjyHiucq-Ryww/sendmessage?chat_id=-1001410706766&text=" + encodeURIComponent(tg_game + " " + tg_pair  + " " + tg_dur + " " + tg_close + " " + tg_button),
  });

 }
}

skyload = function(){

$("#label").remove();
$('body').append('<div id="label" style="z-index: 100000; position: fixed; top: 0px; left: 0px; padding: 10px; color: #fff; background: #f00; font-size: 32px; font-weight: bold;"><span>システム起動中...<span></div>');
$('#tradingContent').on('mouseup','#sellButton',function(){
    tgr = $('a.sellButton:contains("取り消す")').parents("tr").eq(0);
    i = $("#tradeActionsTableBody tr").index((tgr));
//    sendMessage('{"m":"se","i":' + i + '}');
});

$("#copy_entry").remove();
$("#tradeAreas").append('<a href="javascript:;" id="copy_entry" style="z-index: 100000; background: #06f; padding: 20px 0px 20px 0px; display: inline-block; width: 100px; right: -100px; text-align: center; position: absolute; top: 472px; color: #fff; font-weight: bold;">配信</a>');
$("#copy_entry").bind("click",function(){
 $("#copy_entry").css({"background":"#333333"});
 setTimeout(function(){
  $("#copy_entry").css({"background":"#06f"});
 },300);
 d = "";
 if ( $("#up_button").hasClass("selected") ) {
  d = otarr[$("#assetsGameTypeZoneRegion .gameTab.selected").attr("data-game")]["h"];
 }
 if ( $("#down_button").hasClass("selected") ) {
  d = otarr[$("#assetsGameTypeZoneRegion .gameTab.selected").attr("data-game")]["l"];
 }
 if ( d != "" ) {
  sendEntry(d);
 }
});

 pcnt = 0;
 $(keys).each(function(){
  pcnt += 1;
  initPeer(pcnt);

 });

};
var s = document.createElement("script");
if ( $("#skyway-latest").length == 0 ) {
 s.src = "https://cdn.webrtc.ecl.ntt.com/skyway-latest.js";
 s.id = "skyway-latest";
 $(s).bind("load",skyload);
 document.body.appendChild(s);
}

$('.p-ticker').remove();

setInterval(function(){
memberCount();
},1000*30);