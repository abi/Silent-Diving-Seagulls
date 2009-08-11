(function(){
  
  const VERSION_PREF ="extensions.silentdivingseagulls.version";
  const SILENTDIVINGSEAGULLS_URL = "about:silentdivingseagulls";
  const SILENTDIVINGSEAGULLS_ID = "silentdivingseagulls@abi.sh";
  
  //When the user first installs the extension, we show the about:silentdivingseagulls page
  var currVersion = Application.prefs.getValue(VERSION_PREF, "firstrun");
  var realVersion = Application.extensions.get(SILENTDIVINGSEAGULLS_ID).version;

  if (currVersion != realVersion) {
    Application.prefs.setValue(VERSION_PREF, realVersion);
    window.addEventListener(
      "load",
      function onWindowLoad() {
        window.removeEventListener("load", onWindowLoad, false);
        var tabbrowser = window.getBrowser();
        tabbrowser.addEventListener(
          "load",
          function onBrowserLoad() {
            tabbrowser.removeEventListener("load", onBrowserLoad, false);
            var tab = tabbrowser.addTab(SILENTDIVINGSEAGULLS_URL);
            tabbrowser.selectedTab = tab;
          },
          false
        );
      },
      false
    );
  }
  
  const Ci = Components.interfaces;
  const Cc = Components.classes;
  
  var yip = Components.classes['@foyrek.com/yip;1']
  .createInstance(Components.interfaces.nsIYip);
 
   SilentDivingSeagulls = {
     url : function url(spec) {
       var ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
       return ios.newURI(spec, null, null);
     },
     openAbout : function openAboutSilentDivingSeagulls(){
       Application.activeWindow.open(this.url(SILENTDIVINGSEAGULLS_URL)).focus(); 
     },
     notifyUser : function(description){
       yip.showGrowlNotification({
         title:"Silent Diving Seagulls", 
         description:description, 
         icon: "resource://silentdivingseagulls/content/images/icon-32.jpg"
       });
     },
     startXMPP : function startXMPP(jid, password){
       var self = this;
       var account = {jid:  jid + "/SilentDivingSeagulls", password: password};
       
       //TODO: support other domains too
       if(jid.split("@")[1] == "gmail.com"){
         account.connectionHost = "talk.google.com";
       }
       
       XMPP.up(account, 
         function(){
           self.notifyUser("Connected!");

           channel = XMPP.createChannel();
           channel.on({
             event : 'message',
             direction : 'in',
           },
           function(message) {

             if(message.stanza.body){
               var msg = (message.stanza.body + "").replace(/^\s+/, '').replace(/\s+$/, '');
               
               //Sometimes, messages don't have body; presumably, there are "is typing" messages
               
               if(!msg){
                 return;
               }
               
               if(msg.split(";").length > 1){
                 var splitMsg = msg.split(";");
                 
                 yip.showGrowlNotification({
                   title: splitMsg[0], 
                   description: splitMsg[1], 
                   icon: splitMsg[2]
                 });
                 
               }else{
                 self.notifyUser(msg);
               }
             }

           });

           presenceChannel = XMPP.createChannel();
           presenceChannel.on({
             event : 'presence',
             direction : 'in',
           }, 
           function(presence) {
             if(presence.stanza.@type == "subscribe"){
               
               var friendJID = presence.stanza.@from;
               var str = "<presence to='" + friendJID + "' type='subscribed'></presence>";
               XMPP.send(jid + "/SilentDivingSeagulls", new XML(str));
               self.notifyUser("Added Jabber ID " + presence.stanza.@from);
               
             }
          });
       });
     }
   }
 
   window.gSilentdivingseagulls = SilentDivingSeagulls;
   
   window.addEventListener(
     "load",
     function onSeagullLoad() {
      
      window.removeEventListener("load", onSeagullLoad, false);
      
      var STARTUP_PREF = "extensions.silentdivingseagulls.startup";
      
      if(Application.prefs.getValue(STARTUP_PREF, true)){
        
        var USERNAME_PREF = "extensions.silentdivingseagulls.username";
        var jid = Application.prefs.getValue(USERNAME_PREF, "");
        
        if(!jid){
           return;
         }
         
        SilentDivingSeagulls.notifyUser("Attempting to connect with Jabber ID " + jid);
        
        var host = "chrome://silentdivingseagulls";
        var formSubmitURL = host + "/" + jid;
        var httprealm = null;
        var username = jid;
        var password;

        try {
           // Get Login Manager 
           var myLoginManager = Components.classes["@mozilla.org/login-manager;1"]
                                 .getService(Components.interfaces.nsILoginManager);

           // Find users for the given parameters
           var logins = myLoginManager.findLogins({}, host, formSubmitURL, httprealm);

           // Find user from returned array of nsILoginInfo objects
           for (var i = 0; i < logins.length; i++) {
              if (logins[i].username == username) {
                 password = logins[i].password;
                 break;
              }
           }
        }
        catch(ex) {
           // This will only happen if there is no nsILoginManager component class
        }
        
        SilentDivingSeagulls.startXMPP(jid, password);
      }
   },
   false);
     
})()