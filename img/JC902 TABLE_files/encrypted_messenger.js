/**
 * Library to encrypt and decrypt post messages.
 */
var EncryptedMessenger = function() {};

/**
 * Encrypts and sends message to intended URL.
 * @param oWindow
 * @param mTargetUrl
 * @param mFunctionName
 * @param mContext
 * @param mData
 */
EncryptedMessenger.prototype.sendMessage = function(oWindow, mTargetUrl, mFunctionName, mContext, mData) {
    try {
        var oData = encodeURIComponent(JSON.stringify({
            function_name : mFunctionName,
            context       : (typeof mContext === 'string') ? mContext : '',
            data          :  mData,
            target_url    : (typeof mTargetUrl === 'string') ? mTargetUrl : '',
            timestamp     : Date.now()
        }));
        oWindow.postMessage(oData, '*');
        return;
    } catch (err) {
        return;
    }
};

/**
 * Decrypts and reads intended message.
 * @param oEvent
 * @param oCallback
 * @returns {*}
 */
EncryptedMessenger.prototype.readMessage = function(oEvent, oCallback) {
    
    try {
        if (oEvent.data !== null && typeof oCallback === 'function') {
            var oData = JSON.parse(decodeURIComponent(oEvent.data));
            var sDataTargetUrl = (oEvent.target.location.protocol + '//' + oEvent.target.location.hostname).trim();
            var oEventTargetUrl = this.parseURL(oData.target_url);
            var sEventTargetUrl = (oEventTargetUrl.protocol + '//' + oEventTargetUrl.hostname).trim();
            if (sDataTargetUrl === sEventTargetUrl && (Date.now() - oData.timestamp) <= 2000) return oCallback(oData);
        }
        return;
    } catch (err) {
        return;
    }
};

/**
 * Returns an object of the given url
 * @param sUrl
 * @returns {{protocol: string | RTCIceProtocol, host: (string|string|Element|*), hostname: string, port: (string|number|string|MessagePort|*), pathname: string, search: (string[]|string[]|((regexp: (string | RegExp)) => number)|string|symbol|((searcher: {[Symbol.search](string: string): number}) => number)), searchObject, hash: *}}
 */
EncryptedMessenger.prototype.parseURL = function (sUrl) {
    var oParser = document.createElement('a');
    oParser.href = sUrl;
    var oSearchObject = {};
    var aQueries = [];
    var aSplit = [];
    aQueries = oParser.search.replace(/^\?/, '').split('&');
    aQueries.forEach(function(oElement, iIndex) {
        aSplit = aQueries[iIndex].split('=');
        oSearchObject[aSplit[0]] = aSplit[1];
    });
    return {
        protocol     : oParser.protocol,
        host         : oParser.host,
        hostname     : oParser.hostname,
        port         : oParser.port,
        pathname     : oParser.pathname,
        search       : oParser.search,
        searchObject : oSearchObject,
        hash         : oParser.hash
    };
};
