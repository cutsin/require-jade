前端加载jade
=======================

前端加载jade，依赖node服务

## Describtion

如果一时用不了webpack，又不想拼字符串，也不想用requirejs官方的jade重器，那就这样hack呗……


## Install

其实就是需要在你的本机起个node server，配好`/jadeApi/`的路径。

```bash
nvm i *.*.*
npm i cutsin/jade && npm i coffee-script -g && npm i express
vi app.coffee.md
```
```coffeescript
jade = require 'jade'
jsPath = path.resolve __dirname, './j/tmp/' # 你的jade模板目录
express = require 'express'
app = express()
app.get '/jadeApi/:filepath', (req, res) ->
	_path = path.join jsPath, decodeURIComponent req.params.filepath
	res.render _path
app.listen 3000
```
```bash
coffee app.coffee.md
```



## Example

page:
```html
<script>
var require = {
	paths: {
		jade: 'https://github.com/cutsin/require-jade/blob/master/require-jade.js'
	}
}</script>
<script data-main="jade!app/main" src="//static.abc.com/j/pub/require/2.1.14.js"></script>
```
app/main.coffee.md:
```coffeescript
  require [
	  'lcs!tmpl/hello'
  ], (tmpl) ->
    console.log tmpl
```