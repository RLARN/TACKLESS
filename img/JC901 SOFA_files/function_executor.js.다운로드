/**
 * Constructor for FunctionExecutor
 * @constructor
 */
var FunctionExecutor = function() {};

/**
 * Execute function by context and function name.
 * @param sFunctionName
 * @param mContext
 * @returns {*}
 */
FunctionExecutor.prototype.execute = function(sFunctionName, mContext /*, arguments*/) {
    try {
        var args = Array.prototype.slice.call(arguments, 2);
        var namespaces = sFunctionName.split(".");
        var func = namespaces.pop();
        for(var i = 0; i < namespaces.length; i++) {
            mContext = mContext[namespaces[i]];
        }
        return mContext[func].apply(mContext, args);
    } catch (oException) {
        return;
    }
};
