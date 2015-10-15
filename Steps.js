/**
 * 异步处理
 * @author kainanhong
 * @version 2015.10.13
 */
;(function(_){
"use strict";
function Steps(){
    if(!(this instanceof Steps)) return new Steps([].slice.call(arguments, 0));
    this.fns = [], this.args = [];
    arguments.length > 0 && this.then.apply(this, arguments[0].push ? arguments[0] : [].slice.call(arguments, 0));
}
Steps.prototype = {
    constructor : Steps,
    then : function(){
        var _this = this, fns = arguments[0].push ? arguments[0] : [].slice.call(arguments, 0);
        for(var i = 0, l = fns.length; i < l; i++){
            fns[i].index = i;
            fns[i].done = function(){
                delete this.done;
                _this.args[this.index] = [].slice.call(arguments, 0);
                for(var args = [], i = 0, l = _this.step.length; i < l; i++) if(_this.step[i].done) return;
                for(i = 0, l = _this.args.length; i < l; i++) args = args.concat(_this.args[i]);
                _this.args = [];
                _this.done.apply(_this, args);
            }
        }
        this.fns.push(fns);
        return this;
    },
    done : function(){
        var fns = this.step = this.fns.shift(), args = [].slice.call(arguments, 0);
        if(fns) for(var i = 0, l = fns.length; i < l; i++) fns[i].apply(fns[i], args);
    }
};
_.Steps = _.Steps || Steps;
})(window);
