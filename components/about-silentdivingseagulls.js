// Thanks to https://developer.mozilla.org/En/Custom_about:_URLs

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

const Cc = Components.classes;
const Ci = Components.interfaces;

function SilentDivingSeagullsAboutHandler() {
}

SilentDivingSeagullsAboutHandler.prototype = {
    newChannel : function(aURI) {
        var ios = Cc["@mozilla.org/network/io-service;1"].
                  getService(Ci.nsIIOService);

        var channel = ios.newChannel(
          "chrome://silentdivingseagulls/content/silentdivingseagulls.html",
          null,
          null
        );

        channel.originalURI = aURI;
        return channel;
    },

    getURIFlags: function(aURI) {
        return Ci.nsIAboutModule.ALLOW_SCRIPT;
    },

    classDescription: "About SilentDivingSeagulls Page",
    classID: Components.ID("50681bf0-4d31-11de-8a39-0800200c9a66f"),
    contractID: "@mozilla.org/network/protocol/about;1?what=silentdivingseagulls",
    QueryInterface: XPCOMUtils.generateQI([Ci.nsIAboutModule])
}

function NSGetModule(aCompMgr, aFileSpec) {
  return XPCOMUtils.generateModule([SilentDivingSeagullsAboutHandler]);
}