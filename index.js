var grunt = require('grunt'),
    path = require('path'),
    url = require('url');

var Util = {
    getJSON: function( filepath ){
        var ret = null,
            str = grunt.file.exists(filepath) &&  grunt.file.read( filepath );

        ret = eval('('+str+')');

        return ret;
    },
    getUrlRelativeToCertainFilepath: function (filepath, filepathOfContainingFile, filepathToGetRelativeResult){
        var localAbsoluteFilepath = path.resolve( path.dirname(filepathOfContainingFile), filepath );    // css文件的本地真实绝对路径
        var ret = path.relative( filepathToGetRelativeResult, localAbsoluteFilepath );
        return ret.replace(/\\/g, '/');
    },
    copyDir: function(src, dest){
        if(!grunt.file.exists(src)){
            grunt.log.error('目录 '+src+' 不存在！');
            return;
        }
        if(!grunt.file.exists(dest)) grunt.file.mkdir(dest);

        grunt.file.recurse(src, function(abspath, rootdir, subdir, filename){
            grunt.file.copy(abspath, abspath.replace(src, dest));
        });
    },
    textReplace: function(text, arr){
        arr = arr || [];
        arr.forEach(function(obj, index){
            text = text.replace(obj.from, function(){
                return obj.to(arguments[0], 0, '', Array.prototype.slice.call(arguments, 1));
            });
        });
        return text;
    },
    formatDate: function(pattern,date){
        function formatNumber(data,format){//3
            format = format.length;
            data = data || 0;
            //return format == 1 ? data : String(Math.pow(10,format)+data).substr(-format);//IE6有bug
            //return format == 1 ? data : (data=String(Math.pow(10,format)+data)).substr(data.length-format);
            return format == 1 ? data : String(Math.pow(10,format)+data).slice(-format);
        }

        return pattern.replace(/([YMDhsm])\1*/g,  function(format){
            switch(format.charAt()){
                case 'Y' :
                    return formatNumber(date.getFullYear(),format);
                case 'M' :
                    return formatNumber(date.getMonth()+1,format);
                case 'D' :
                    return formatNumber(date.getDate(),format);
                case 'w' :
                    return date.getDay()+1;
                case 'h' :
                    return formatNumber(date.getHours(),format);
                case 'm' :
                    return formatNumber(date.getMinutes(),format);
                case 's' :
                    return formatNumber(date.getSeconds(),format);
            }
        });
    },
    fileType: function(filepath){
        return require('path').extname(filepath).toLowerCase().slice(1);
    },
    wrap: function(str, flag){
        flag = flag || "'";
        return flag + str + flag;
    },
    getMD5Filepath: function(src, relativeTo){
        // var fullpath = path.resolve(relativeTo || '', src);
        var fullpath = src.replace(/\\/g, '/');
        var filename = path.basename(fullpath);
        var dirname = path.dirname(fullpath);

        console.log('src = ' + src + ', relativeTo = ' + relativeTo);
        console.log('filename = ' + filename);
        console.log('dirname = ' + dirname);

        var pattern = dirname + '/*.' + filename;
        console.log('pattern = ' + pattern);

        var matchFile = grunt.file.expand({
            cwd: relativeTo || ''
        }, pattern);
        console.log('matchFile = ' + matchFile);

        if(matchFile.length){
            return matchFile[0].replace(/\\/g, '/');
        }else{
            return src;
        }
    },
    insertVersion: function(url, version){
        var type = Util.fileType(url);
        var ret = url;
        var arr = url.split('/');

        switch(type){
            case 'css':
                ret = url.replace(/([^\/]+\.css)$/, version+'/$1');
                break;
            case 'js':
                ret = url.replace(/([^\/]+\.js)$/, version+'/$1');
                break;
            default:
                arr.splice(arr.length-1, 0, version);
                ret = arr.join('/');
                break;
        }
        return ret;
    }
};

module.exports = Util;