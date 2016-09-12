/**
 * 异步处理
 * @author kainanhong
 * @version 2016.9.12
 * @source https://github.com/hellobugme/Steps.js
 */
;(function(){
"use strict";
function Steps(fns){
    if(!(this instanceof Steps)) return new Steps([].slice.call(arguments, 0));
    this.steps = [];
    this.args = [];
    this.timeLog = [];
    if(arguments.length > 0) this.then.apply(this, fns.push ? fns : [].slice.call(arguments, 0));
}
Steps.prototype = {
    constructor : Steps,
    then: function(fns){
        var instance = this;
        var step = arguments.length > 0 && fns.push ? fns : [].slice.call(arguments, 0);
        var count = step.length;
        if(count > 0){
            step.index = instance.steps.length;
            for(var i = 0; i < count; i++){
                var fn = step[i];
                fn.stepIndex = step.index;
                fn.fnIndex = i;
                fn.done = function(){
                    if(instance.isError) return;
                    instance.timeLog[this.stepIndex][this.fnIndex] = +Date.now() - instance.timeLog[this.stepIndex][this.fnIndex];
                    instance.args[this.fnIndex] = [].slice.call(arguments, 0);
                    if(--instance.step.count > 0) return;
                    for(var args = [], i = 0, l = instance.args.length; i < l; i++) args = args.concat(instance.args[i]);
                    instance.args = [];
                    instance.done.apply(instance, args);
                };
                fn.error = function(){
                    if(instance.isError) return;
                    instance.isError = true;
                    instance.errorFn.apply(instance.errorFn, [].slice.call(arguments, 0));
                };
            }
            step.count = count;
            this.timeLog.push([]);
            this.steps.push(step);
        }
        return this;
    },
    done: function(){
        var args = [].slice.call(arguments, 0);
        this.step = this.steps[this.step ? (this.step.index + 1) : 0];
        if(this.step){
            for(var i = 0, count = this.step.length; i < count; i++){
                var fn = this.step[i];
                this.timeLog[fn.stepIndex][fn.fnIndex] = +Date.now();
                fn.apply(fn, args);
            }
        }else{
            if(this.timeLogFn) this.timeLogFn(this.timeLog);
        }
    },
    error: function(fn){
        this.errorFn = fn;
        return this;
    },
    getTimeLog: function(fn){
        this.timeLogFn = fn;
        return this;
    }
};
if(window) window.Steps = Steps;
})();
