// Custom Ajax Implementation using XMLHttpRequest
var Ajax = (function() {

    var fn, api;

    fn = {
        _ajax: function (type, url, data, callback) {
            var xhr = new XMLHttpRequest();
            xhr.open(type, url, true);
            xhr.onreadystatechange = function() {
                if (this.readyState === 4 && this.status === 200) {
                    callback.call(null, this.response);
                }
            }
            xhr.responseType = 'json';
            xhr.send(data);
        },
        _get: function(url, data, callback) {
            return fn._ajax('GET', url, data, callback);
        },
        _post: function(url, data, callback) {
            return fn._ajax('POST', url, data, callback);
        }
    };

    api = {
        get: function() {
            return fn._get.apply(null, arguments);
        },
        post: function() {
            return fn._post.apply(null, arguments);
        }
    };

    return api;
})();
