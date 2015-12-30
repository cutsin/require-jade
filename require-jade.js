/*
 * require node server with /jade/:filepath
*/

var jadeApi = function(filepath) {
  return '/jadeApi/' + filepath
}

define(function(){
  var fetchText = function(){}
  var buildMap = {}
  // node
  if (typeof process !== "undefined" && process.versions && !!process.versions.node) {
    path = require.nodeRequire('path')
    fs = require.nodeRequire('fs')
    jade = require.nodeRequire('jade')
    fetchText = function(url, config, callback){
      url = decodeURIComponent(url).replace('/jadeApi/','') + '.jade'
      jadeConf = {
        compileDebug: false,
        cache: false,
        omitTag: 'radical',
        basedir: './',
        __: config.__,
        __n: config.__n
      }
      filePath = path.resolve('./j/rClient/v2',url)
      html = jade.renderFile(filePath, jadeConf)
      callback(html)
    }

  // browser
  } else {
    var isXDR
    // Simple Ajax Loader
    var progIds = ['Msxml2.XMLHTTP','Microsoft.XMLHTTP','Msxml2.XMLHTTP.4.0']
    var getXhr = function(){
      if(typeof window.XDomainRequest !== 'undefined'){
        isXDR = true
        return new window.XDomainRequest()
      }
      if(typeof XMLHttpRequest !== 'undefined'){
        return new XMLHttpRequest()
      }
      var xhr
      for(var i=0;i<progIds.length;i++){
        var progId = progIds[i]
        xhr = new ActiveXObject(progId)
        if(xhr){
          progIds = [progId]
          return xhr
        }
      }
    }

    // get file
    fetchText = function(url, config, callback){
      var xhr = getXhr()
      xhr.open('GET', url, true)
      if(isXDR){
        xhr.onload = function(){
          callback(xhr.responseText)
        }
      }else{
        xhr.onreadystatechange = function(){
          if(xhr.readyState === 4){
            callback(xhr.responseText)
          }
        }
      }
      xhr.send(null)
    }
  }

  var jsEscape = function(content) {
    return content.replace(/(['\\])/g, '\\$1')
                  .replace(/[\f]/g, "\\f")
                  .replace(/[\b]/g, "\\b")
                  .replace(/[\n]/g, "\\n")
                  .replace(/[\t]/g, "\\t")
                  .replace(/[\r]/g, "\\r")
                  .replace(/[\u2028]/g, "\\u2028")
                  .replace(/[\u2029]/g, "\\u2029");
  }

  return {
    fetchText: fetchText,
    get: function() {
    },
    write: function(pluginName, moduleName, write, config) {
      if (buildMap.hasOwnProperty(moduleName)) {
        write.asModule(pluginName + '!' + moduleName, buildMap[moduleName])
      }
    },
    load: function(moduleName, parentRequire, load, config){
      var para = encodeURIComponent(parentRequire.toUrl(moduleName))
      var path = jadeApi(encodeURIComponent(moduleName))
      fetchText(path, config, function(html){

        html = "define(function(){ return '" + jsEscape(html) + "'});\n"
        // console.log(html)

        if (config.isBuild) {
            buildMap[moduleName] = html;
        }

        load.fromText(moduleName, html)
        // return result
        parentRequire([moduleName], function(content){
          load(content)
        })

      })
    }
  }
})
