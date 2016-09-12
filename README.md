# Steps.js

JavaScript 异步处理

* Author : Kainan Hong <<1037714455@qq.com>>
* Source : https://github.com/hellobugme/Steps.js/

## Feature

* 并行与串行
* 参数集合传递
* 链式调用
* 无依赖

## Methods

* `steps.then(...stepFns)` / `steps.then([stepFn1, stepFn2, ...])`
 + 添加步骤
* `steps.done(...params)`
 + 启动步骤
 + 向首个步骤传递参数
* `steps.error(errFn)`
 + 设置出错时触发事件
* `steps.getTimeLog(timeLogFn)`
 + 所有步骤完成后，可获取到各个步骤函数的耗时
* `stepFn.done(...params)`
 + 如果当前步骤完成，启动下个步骤
 + 向下个步骤传递参数
* `stepFn.error(...params)`
 + 步骤函数调用 : 终止所有步骤，并触发链上的错误事件

## Simple Example

* 并行 : `Steps(stepFn1, stepFn2, stepFn3).done()`
* 串行 : `Steps(step1).then(step2).then(step3).dnoe()`
* 错误 : `Steps(step1).then(step2).error(errorFn).done()`
* 耗时 : `Steps(stepFn1, stepFn2).then(step2).getTimeLog(timeLogFn).dnoe()`

## Example 1

```javascript
Steps(
    function(){
        console.log("step.1   : ", arguments); // ["param.start"]
        this.done("param.1");
    }
).then(
    function(){
        var _this = this, args = arguments;
        // 异步
        setTimeout(function(){
            console.log("step.2.1 : ", args); // ["param.1"]
            // 保存多个参数
            _this.done("param.2.1.1", "param.2.1.2");
        }, 1000);
    },
    function(){
        console.log("step.2.2 : ", arguments); // ["param.1"]
        // 不保存参数
        this.done();
    },
    function(){
        console.log("step.2.3 : ", arguments); // ["param.1"]
        this.done("param.2.3");
        // this.error("step2 fn3 is error");
    }
).then(
    function(){
        console.log("step.3   : ", arguments); // ["param.2.1.1", "param.2.1.2", "param.2.3"]
        this.done();
    }
).error(
    function(){
        console.log(arguments); // ["step2 fn3 is error"]
    }
).getTimeLog(
    function(timeLog){
        console.log(JSON.stringify(timeLog)); // [[9], [1002, 1, 1], [1]]
    }
).done("param.start");
```
Demo : http://runjs.cn/code/t3s81k1t

## Example 2

```javascript
Steps(
    function(){
        // step.1.1 : 从 .txt 文件中获取数据
        var _this = this;
        $.ajax({
            // 请求大文件，用于测试返回顺序和 step.2 参数顺序
            // url: 'https://code.jquery.com/jquery-git1.min.js',
            url: './data.txt',
            dataType: 'text',
            success: function(str) {
                // 如果是大文件，虽然是最后输出，但在 step.2 中仍是 data1
                console.log(str);
                // 步骤完成，并保存下个步骤要使用到的数据
                _this.done(str.replace(/\r\n/g, "<br/>"));
            }
        });
    },
    function(){
        // step.1.2 : 从 .js 文件中获取数据
        var _this = this;
        $.getScript('./data.js', function(){
            console.log(window.data);
            _this.done(window.data);
        });
    },
    function(){
        // step.1.3 : 从 .json 文件中获取数据
        var _this = this;
        $.getJSON('./data.json', function(json){
            console.log(json);
            _this.done(json.data);
        });
    }
).then(
    function(data1, data2, data3){
        // step.2 : 使用数据
        console.log(data1, data2, data3);
        this.done();
    }
).done();
```
Demo : http://runjs.cn/code/2arxvtok

## Example 3

```javascript
Steps(
    // 传入数组
    $.map(["./data1.txt", "./data2.txt", "./data3.txt"], function(fileURL){
        return function(){
            var _this = this;
            $.ajax({
                url: fileURL,
                dataType: "text",
                success: function(str) {
                    _this.done(str.replace(/\r\n/g, "<br/>"));
                }
            });
        };
    })
).then(
    function(){
        var datas = [].slice.call(arguments, 0);
        console.log(datas);
    }
).done();
```
Demo : http://runjs.cn/code/71p9sez9

## Example 4

```javascript
// 扩展 wait() 方法
Steps.prototype.wait = function(delay){
	return this.then(function(){
		var _this = this, args = [].slice.call(arguments, 0);
		setTimeout(function(){
			_this.done.apply(_this, args);
		}, delay || 0);
	});
};

var num = 10, size = 40, blocks = [];
Steps(
	function(){
		// 创建方块
		var _this = this;
			body = $("body"),
			maxW = $(window).width() - size,
			maxH = $(window).height() - size,
			steps = Steps().wait(500);
		for(var i = 0; i < num; i++){
			steps.then(function(){
				var _this = this,
				block = $('<div class="block"></div>').css({
					position: "absolute",
					width: size,
					height: size,
					backgroundColor : "#" + ("00000" + (Math.random() * 0xFFFFFF << 0).toString(16)).slice(-6),
					left : Math.random() * maxW
				}).appendTo(body)
					.animate({ top : maxH }, 1000, "easeOutBounce");
				setTimeout(function(){ _this.done(); }, 100);
				blocks.push(block);
			});
		}
		steps.then(function(){ 
			this.done();
			_this.done();
		}).done();
	}
).wait(1000).then(
	function(){
		// 在左侧排成一列
		var _this = this;
			steps = Steps();
		for(var i = 0; i < num; i++){
			steps.then(function(i){
				var _this = this;
				blocks[i].animate({ top : (maxH - size * num) / 2 + i * size, left : 0 }, 100, null, function(){
					_this.done(++i);
				});
			});
		}
		steps.then(function(){
			this.done();
			_this.done();
		}).done(0);
	}
).wait(500).then(
	function(){
		// 在中间排成一行
		var _this = this,
			steps = Steps(), 
			i = 0;
		steps.then(
			$.map(blocks, function(){
				return function(){
					var _this = this,
						top = (maxH - size) / 2,
						left = (maxW - size / 2 * num) / 2 + i * size / 2;
					blocks[i++].animate({ top : top, left : left }, 500, function(){
						_this.done();
					});
				};
			})
		);
		steps.then(function(){
			this.done();
			_this.done();
		}).done();
	}
).wait(100).then(
	function(){
		// 蠕动
		var _this = this,
			steps = Steps(),
			i = 0,
			isOpened = false;
		(function addNextSteps(){
			steps.then($.map(blocks, function(){
				return function(){
					var _this = this, left;
					if(isOpened) left = (maxW - size / 2 * num) / 2 + i * size / 2;
					else left = (maxW - size / 3 * 2 * num) / 2 + i * size / 3 * 2;
					blocks[i++].animate({ left : left }, 500, function(){
						_this.done();
					});
				};
			})).then(function(){
				i = 0;
				isOpened = !isOpened;
				addNextSteps();
				this.done();
			});
		})();
		steps.done();
	}
).then(
	function(){
		alert("all done");
		this.done();
	}
).done();
```
Demo : http://runjs.cn/code/djqb7whf
