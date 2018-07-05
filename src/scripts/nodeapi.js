var Node = (function() {

    var fn, api;

    fn = {
        _createElement: function(type, config) {

            var elem = document.createElement(type);

            if (config) {
                for (var i in config) {
                    if (config.hasOwnProperty(i)) {

                        if (i === 'class') {
                            config[i].forEach(function(c) {
                                elem.classList.add(c);
                            });
                        } else {
                            elem[i] = config[i];
                        }
                    }
                }
            }

            return elem;

        },
        _listen: function(type, element, callback) {
            if(!element) {
                return null;
            }
            element.addEventListener(type, function(event) {
                callback.call(null, event);
            })
        },
        _append: function(parent, child) {
            parent.appendChild(child);
            return parent;
        },
        _byId: function(id) {
            return document.getElementById(id);
        },
        _byClass: function(className) {
            return document.getElementsByClassName(className);
        },
        _appendAll: function(parent, arr) {
            var frag = document.createDocumentFragment();
            arr.forEach(function(a) {
                frag.appendChild(a);
            })
            parent.appendChild(frag);
            return parent; 
        },
        _closest: function(node, selector) {
            if (selector[0] === '.') {
                var className = selector.substring(1);
                while (node && node !== document && !node.classList.contains(className)) {
                    node = node.parentNode;
                }
            } else if(selector[0] === '#') {
                var id = selector.substring(1);
                while (node && node.id !== id) {
                    node = node.parentNode;
                }
            }
            return node === document ? null : node;
        },
        _removeClass: function(node, classNameToRemove) {
            if(!node) {
                return;
            }
            if(node.classList && node.classList.contains(classNameToRemove)) {
                node.classList.remove(classNameToRemove);
            }
        },
        _removeAllClass: function(selector, classNameToRemove) {
            var nodes = document.querySelectorAll(selector);
            if(!nodes) {
                return;
            }
            for(var i = 0; i < nodes.length; ++ i) {
                fn._removeClass(nodes[i], classNameToRemove);
            }
        },
        _addClass: function(node, classNameToAdd) {
            if(!node) {
                return;
            }
            if(node.classList) {
                node.classList.add(classNameToAdd);
            }
        },
    };

    api = {
        create: function() {
            return fn._createElement.apply(null, arguments);
        },
        listen: function() {
            return fn._listen.apply(null, arguments);
        },
        append: function() {
            return fn._append.apply(null, arguments);
        },
        byId: function() {
            return fn._byId.apply(null, arguments);
        },
        byClass: function() {
            return fn._byClass.apply(null, arguments);
        },
        appendAll: function() {
            return fn._appendAll.apply(null, arguments);
        },
        closest: function() {
            return fn._closest.apply(null, arguments);
        },
        removeAllClass: function() {
            return fn._removeAllClass.apply(null, arguments);
        },
        addClass: function() {
            return fn._addClass.apply(null, arguments);
        }
    };

    return api;

})();
