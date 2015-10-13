/**
 * 异步处理
 * @author kainanhong
 * @version 2015.10.13
 */
;(function(_){
"use strict";
function Steps(){
    if(!(this instanceof Steps)) return new Steps([].slice.call(arguments, 0));
    this.fns = [];
    arguments.length > 0 && this.then.apply(this, arguments[0].push ? arguments[0] : [].slice.call(arguments, 0));
}
Steps.prototype = {
    constructor : Steps,
    then : function(){
        var steps = this, fns = [].slice.call(arguments, 0), fn;
        for(var i = 0, l = fns.length; i < l; i++){
            fn = fns[i];
            fn.index = i;
            fn.group = fns;
            fn.done = function(){
                this.status = "done";
                steps.args[this.index] = [].slice.call(arguments, 0);
                for(var i = 0, l = this.group.length; i < l; i++) if(this.group[i].status !== "done") return;
                for(var args = [], i = 0, l = steps.args.length; i < l; i++) args = args.concat(steps.args[i]);
                steps.done.apply(steps, args)
            }
        }
        this.fns.push(fns);
        return this;
    },
    done : function(){
        if(this.fns.length === 0) return;
        this.args = [];
        var fns = this.fns.shift(),
            args = [].slice.call(arguments, 0);
        for(var i = 0, l = fns.length; i < l; i++) fns[i].apply(fns[i], args);
    }
};
_.Steps = Steps;
})(window);