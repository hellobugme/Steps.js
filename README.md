# Steps.js

JavaScript 异步处理

* Author : Kainan Hong <<1037714455@qq.com>>
* Source : https://github.com/hellobugme/Step.js/

## Example 1

```javascript
Steps(function(){
    console.log("step.1   : ", arguments);
    this.done("param.1");
}).then(function(){
    var _this = this, args = arguments;
    // 异步
    setTimeout(function(){
        console.log("step.2.1 : ", args);
        // 保存多个参数
        _this.done("param.2.1.1", "param.2.1.2");
    }, 1000);
}, function(){
    console.log("step.2.2 : ", arguments);
    // 不保存参数
    this.done();
}, function(){
    console.log("step.2.3 : ", arguments);
    this.done("param.2.3");
}).then(function(){
    console.log("step.3   : ", arguments); // ["param.2.1.1", "param.2.1.2", "param.2.3"]
    this.done();
}).done("param.start");
```

## Example 2

```javascript
Steps(function(){
    // step.1.1 : 从 .txt 文件中获取数据
    var _this = this;
    $.ajax({
        // 请求大文件，用于测试返回顺序和 step.2 参数顺序
        // url: 'https://code.jquery.com/jquery-git1.min.js',
        url: './resource/poem.txt',
        dataType: 'text',
        success: function(data) {
            // 如果是大文件，虽然是最后输出，但在 step.2 中仍是 poem1
            console.log(data);
            // 步骤完成，并保存下个步骤要使用到的数据
            _this.done(data.replace(/\r\n/g, "<br/>"));
        }
    });
}, function(){
    // step.1.2 : 从 .js 文件中获取数据
    var _this = this;
    $.getScript('./resource/poem.js', function(){
        console.log(window.poem);
        _this.done(window.poem);
    });
}, function(){
    // step.1.3 : 从 .json 文件中获取数据
    var _this = this;
    $.getJSON('./resource/poem.json', function(data){
        console.log(data);
        _this.done(data.poem);
    });
}).then(function(poem1, poem2, poem3){
    // step.2 : 使用数据
    $("#content").html(poem1 + "<br/><br/>" + poem2 + "<br/><br/>" + poem3);
    this.done();
}).done();
```