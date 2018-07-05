/**
 * TWO Way binding
 */

(function () {
    var MODEL_KEY = 'pay-model';
    var elements = ['DIV', 'SPAN', 'ARTICLE', 'ASIDE', 'HEADER', 'FOOTER', 'SECTION'];

    var TwoWay = function() {
        this.models = [];
        this.scope = {};
        this.findModels();
        this.bindModels();
    }

    TwoWay.prototype.findModels = function() {
        var nodes = document.querySelectorAll(`[${MODEL_KEY}]`);
        var len = nodes.length;
        for (var i = 0; i < len; ++ i) {
            this.models.push(nodes[i]);
        }
    }

    TwoWay.prototype.bindModels = function() {
        var _this = this;
        this.models.forEach(function(model) {
            var key = model.getAttribute(MODEL_KEY);
            _this.addToScope(key);
            if (model.nodeName === 'INPUT' || model.nodeName === 'TEXTAREA') {
                model.addEventListener('keyup', function(event) {
                    _this.scope[key] = this.value;
                });
            }
        });
    }

    TwoWay.prototype.addToScope = function(property) {
        if (!this.scope[property]) {
            var value;
            var listeners = document.querySelectorAll(`[plis-${property}`);
            var models = this.models;
            Object.defineProperty(this.scope, property, {

                set: function(newValue) {
                    value = newValue;
                    models.forEach(function(model) {
                        if (model.getAttribute(MODEL_KEY) === property) {
                            if (model.nodeName === 'INPUT' || model.nodeName === 'TEXTAREA') {
                                model.value = newValue;
                            }
                        }
                    });

                    listeners.forEach(function(listener) {
                        if (listener.getAttribute('plis-' + property) !== null) {
                            if (elements.indexOf(listener.nodeName) !== -1) {
                                listener.innerHTML = property === 'number' ? Utils.designCreditNumber(newValue) : newValue;
                            }
                        }
                    });
                },

                get: function() {
                    return newValue;
                },

                enumerable: true,

            });
        }
    }

    new TwoWay();

})();
